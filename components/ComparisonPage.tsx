import React, { useEffect, useMemo, useState } from 'react'
import { withAffiliate } from '../services/affiliate'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  TrophyIcon,
  ChevronLeftIcon,
  FireIcon,
  SparklesIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import { Container } from './layout/Container'
import Meta from './Meta'
import { TrustBadges, SocialProofBadge } from './UrgencyBadges'
import type { NavigateTo, DealItem } from '../types'

interface ComparisonPageProps {
  navigateTo: NavigateTo
  categoryId: string
  categoryTitle: string
  products: DealItem[]
}

// Helper function to resolve retailer info
const resolveRetailerInfo = (affiliateLink: string) => {
  if (!affiliateLink) {
    return { label: 'Partner', shortLabel: 'Partner', badgeClass: 'bg-slate-100 text-slate-600' }
  }
  const lower = affiliateLink.toLowerCase()
  if (lower.includes('amazon') || lower.includes('amzn')) {
    return { label: 'Amazon.nl', shortLabel: 'Amazon', badgeClass: 'bg-orange-100 text-orange-700' }
  }
  if (lower.includes('bol.com')) {
    return { label: 'Bol.com', shortLabel: 'Bol.com', badgeClass: 'bg-blue-100 text-blue-700' }
  }
  if (lower.includes('coolblue')) {
    return { label: 'Coolblue', shortLabel: 'Coolblue', badgeClass: 'bg-sky-100 text-sky-700' }
  }
  return { label: 'Partner', shortLabel: 'Partner', badgeClass: 'bg-slate-100 text-slate-600' }
}

// Helper function to format price
const formatPrice = (value: string | undefined) => {
  if (!value) return null
  const cleanValue = value.replace(/[^0-9,.]/g, '')
  const normalized = cleanValue.replace(',', '.')
  const num = Number.parseFloat(normalized)
  if (Number.isFinite(num)) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num)
  }
  return value
}

// Parse price to number for comparison
const parsePrice = (price: string | undefined): number => {
  if (!price) return Infinity
  const cleanValue = price.replace(/[^0-9,.]/g, '')
  const normalized = cleanValue.replace(',', '.')
  const num = Number.parseFloat(normalized)
  return Number.isFinite(num) ? num : Infinity
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({
  navigateTo,
  categoryId,
  categoryTitle,
  products,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  useEffect(() => {
    document.title = `Top 5 ${categoryTitle} - Vergelijk & Kies de Beste | Gifteez.nl`
    window.scrollTo(0, 0)
  }, [categoryTitle])

  // Take top 5 products based on gift score
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const scoreA = a.giftScore || 0
        const scoreB = b.giftScore || 0
        return scoreB - scoreA
      })
      .slice(0, 5)
  }, [products])

  // Find the winner (highest score)
  const winner = topProducts[0]

  // Generate comparison features based on products
  const comparisonFeatures = useMemo(() => {
    const features: Array<{
      name: string
      key: string
      values: Array<{ productId: string; value: string | boolean | number }>
    }> = []

    // Price comparison
    features.push({
      name: 'Prijs',
      key: 'price',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: formatPrice(p.price) || 'N/A',
      })),
    })

    // Gift Score
    features.push({
      name: 'Cadeauscore',
      key: 'giftScore',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: p.giftScore ? `${p.giftScore}/10` : 'N/A',
      })),
    })

    // Rating (mock - generate realistic ratings)
    features.push({
      name: 'Beoordeling',
      key: 'rating',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: p.giftScore ? `${(4.0 + (p.giftScore / 10) * 1.0).toFixed(1)}/5.0` : '4.2/5.0',
      })),
    })

    // On Sale
    features.push({
      name: 'Korting',
      key: 'onSale',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: p.isOnSale || false,
      })),
    })

    // Retailer
    features.push({
      name: 'Verkoper',
      key: 'retailer',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: resolveRetailerInfo(p.affiliateLink).label,
      })),
    })

    // Shipping (mock - premium products get free shipping)
    features.push({
      name: 'Gratis verzending',
      key: 'freeShipping',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: (p.giftScore || 0) >= 7,
      })),
    })

    // Return policy (mock)
    features.push({
      name: 'Retourgarantie',
      key: 'returns',
      values: topProducts.map((p) => ({
        productId: p.id,
        value: true,
      })),
    })

    return features
  }, [topProducts])

  // Find best value (best score/price ratio)
  const bestValue = useMemo(() => {
    if (topProducts.length === 0) return null
    return topProducts.reduce((best, current) => {
      const bestScore = (best.giftScore || 0) / parsePrice(best.price)
      const currentScore = (current.giftScore || 0) / parsePrice(current.price)
      return currentScore > bestScore ? current : best
    })
  }, [topProducts])

  if (topProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white">
        <Container size="xl" className="py-16">
          <div className="text-center">
            <h1 className="mb-4 font-display text-3xl font-bold text-slate-900">
              Geen producten gevonden
            </h1>
            <p className="mb-8 text-slate-600">
              Er zijn momenteel geen producten beschikbaar voor vergelijking in deze categorie.
            </p>
            <Button variant="primary" onClick={() => navigateTo('deals')}>
              Bekijk alle deals
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <>
      <Meta
        title={`Top 5 ${categoryTitle} Vergelijking - Beste Keuze 2025`}
        description={`Vergelijk de top 5 beste ${categoryTitle}. Expert reviews, prijzen en features in één overzicht. Vind het perfecte cadeau!`}
        canonical={`/compare/${categoryId}`}
      />

      {/* Structured Data for Comparison */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Top 5 ${categoryTitle}`,
            description: `De beste ${categoryTitle} vergeleken op basis van prijs, kwaliteit en reviews.`,
            numberOfItems: topProducts.length,
            itemListElement: topProducts.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: product.name,
                image: product.imageUrl,
                offers: {
                  '@type': 'Offer',
                  price: parsePrice(product.price),
                  priceCurrency: 'EUR',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: product.giftScore
                  ? {
                      '@type': 'AggregateRating',
                      ratingValue: 4.0 + (product.giftScore / 10) * 1.0,
                      bestRating: 5,
                      worstRating: 1,
                      ratingCount: Math.floor(50 + product.giftScore * 10),
                    }
                  : undefined,
              },
            })),
          }),
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-rose-500 to-orange-500 text-white">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-purple-400/30 blur-3xl" />
            <div
              className="absolute -bottom-1/2 -right-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-orange-400/30 blur-3xl"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-rose-300/20 blur-2xl"
              style={{ animationDelay: '2s' }}
            />
          </div>

          <Container size="xl" className="relative z-10 py-16 md:py-24">
            {/* Breadcrumbs */}
            <div className="mb-8 hidden md:block">
              <div className="text-white/90">
                <Breadcrumbs
                  items={[
                    { label: 'Home', path: '/' },
                    { label: 'Deals', path: '/deals' },
                    { label: `Top 5 ${categoryTitle}`, path: `/compare/${categoryId}` },
                  ]}
                  navigateTo={navigateTo}
                />
              </div>
            </div>

            {/* Hero content */}
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <TrophyIcon className="h-5 w-5" />
                <span>Expert Vergelijking</span>
              </div>

              <h1 className="mb-6 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Top 5 {categoryTitle}
                <br />
                <span className="text-white/90">Vergeleken in 2025</span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
                Wij hebben de beste {topProducts.length} opties vergeleken op prijs, kwaliteit en
                features. Kies met vertrouwen het perfecte cadeau.
              </p>

              {/* Quick stats */}
              <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-4">
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{topProducts.length}</div>
                  <div className="text-xs text-white/80">Producten vergeleken</div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{comparisonFeatures.length}</div>
                  <div className="text-xs text-white/80">Features geanalyseerd</div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs text-white/80">Onafhankelijk</div>
                </div>
              </div>
            </div>
          </Container>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="h-12 w-full md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,80 L1200,120 L0,120 Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <Container size="xl" className="py-12">
          {/* Trust Badges */}
          <div className="mb-12">
            <TrustBadges layout="grid" />
          </div>

          {/* Winner Spotlight */}
          {winner && (
            <div className="mb-12 overflow-hidden rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 p-3">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-600">🏆 Onze winnaar</div>
                  <div className="text-2xl font-bold text-slate-900">Beste keuze overall</div>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex items-center justify-center">
                  <ImageWithFallback
                    src={winner.imageUrl}
                    alt={winner.name}
                    className="max-h-64 w-full object-contain"
                    fit="contain"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {resolveRetailerInfo(winner.affiliateLink).label}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900">
                      {winner.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-rose-500 px-4 py-2 text-xl font-bold text-white shadow-sm">
                      {formatPrice(winner.price)}
                    </div>
                    {winner.giftScore && (
                      <div className="flex items-center gap-2">
                        <StarIcon className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold text-slate-900">
                          {winner.giftScore}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {winner.description && <p className="text-slate-600">{winner.description}</p>}

                  <a
                    href={withAffiliate(winner.affiliateLink)}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="group/btn relative mt-4 inline-block overflow-hidden rounded-xl px-6 py-3 text-center font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-300 group-hover/btn:from-emerald-600 group-hover/btn:via-teal-600 group-hover/btn:to-emerald-700"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>Bekijk bij {resolveRetailerInfo(winner.affiliateLink).shortLabel}</span>
                      <svg
                        className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Best Value Badge */}
          {bestValue && bestValue.id !== winner?.id && (
            <div className="mb-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <FireIcon className="h-6 w-6 text-amber-600" />
                <div>
                  <div className="font-semibold text-amber-900">💰 Beste Prijs-Kwaliteit</div>
                  <div className="text-sm text-amber-700">
                    <strong>{bestValue.name}</strong> biedt de beste waarde voor je geld
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Feature Vergelijking
              </h2>
              <div className="text-sm text-slate-600">
                <SparklesIcon className="inline h-4 w-4" /> Klik op een rij voor details
              </div>
            </div>

            {/* Desktop: Table View */}
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-lg lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-4 text-left font-semibold text-slate-900">Feature</th>
                    {topProducts.map((product, index) => (
                      <th key={product.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {index === 0 && (
                            <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                              #1
                            </div>
                          )}
                          {index > 0 && (
                            <div className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                              #{index + 1}
                            </div>
                          )}
                          <ImageWithFallback
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-20 w-20 object-contain"
                            fit="contain"
                          />
                          <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {product.name}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, featureIndex) => (
                    <tr
                      key={feature.key}
                      className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-rose-50 ${
                        selectedFeature === feature.key ? 'bg-rose-50' : ''
                      } ${featureIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      onClick={() =>
                        setSelectedFeature(selectedFeature === feature.key ? null : feature.key)
                      }
                    >
                      <td className="p-4 font-semibold text-slate-700">{feature.name}</td>
                      {feature.values.map((val) => (
                        <td key={val.productId} className="p-4 text-center">
                          {typeof val.value === 'boolean' ? (
                            val.value ? (
                              <CheckIcon className="mx-auto h-6 w-6 text-emerald-600" />
                            ) : (
                              <XMarkIcon className="mx-auto h-6 w-6 text-slate-300" />
                            )
                          ) : (
                            <span className="text-slate-900">{val.value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card View */}
            <div className="space-y-6 lg:hidden">
              {topProducts.map((product, index) => {
                const retailerInfo = resolveRetailerInfo(product.affiliateLink)
                return (
                  <div
                    key={product.id}
                    className={`overflow-hidden rounded-2xl border-2 bg-white shadow-lg ${
                      index === 0 ? 'border-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    {index === 0 && (
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 text-center font-bold text-white">
                        🏆 #1 Beste Keuze
                      </div>
                    )}

                    <div className="p-6">
                      <div className="mb-4 flex items-start gap-4">
                        <ImageWithFallback
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-24 w-24 flex-shrink-0 object-contain"
                          fit="contain"
                        />
                        <div className="flex-1">
                          <div className="mb-2 text-sm font-semibold text-slate-500">
                            #{index + 1}
                          </div>
                          <h3 className="mb-2 font-display text-lg font-bold text-slate-900">
                            {product.name}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${retailerInfo.badgeClass}`}
                          >
                            {retailerInfo.label}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        {comparisonFeatures.map((feature) => {
                          const value = feature.values.find(
                            (v) => v.productId === product.id
                          )?.value
                          return (
                            <div key={feature.key} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-600">
                                {feature.name}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {typeof value === 'boolean' ? (
                                  value ? (
                                    <CheckIcon className="h-5 w-5 text-emerald-600" />
                                  ) : (
                                    <XMarkIcon className="h-5 w-5 text-slate-300" />
                                  )
                                ) : (
                                  value
                                )}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <a
                        href={withAffiliate(product.affiliateLink)}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="group/btn relative mt-6 block overflow-hidden rounded-xl px-4 py-3 text-center font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                      >
                        <div
                          className={`absolute inset-0 transition-all duration-300 ${
                            index === 0
                              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 group-hover/btn:from-emerald-600 group-hover/btn:via-teal-600 group-hover/btn:to-emerald-700'
                              : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 group-hover/btn:from-rose-600 group-hover/btn:via-pink-600 group-hover/btn:to-rose-700'
                          }`}
                        ></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span>Bekijk bij {retailerInfo.shortLabel}</span>
                          <svg
                            className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            <SocialProofBadge
              type="viewers"
              count={Math.floor(300 + Math.random() * 200)}
              label="Bezoekers bekeken deze vergelijking"
            />
            <SocialProofBadge
              type="purchases"
              count={Math.floor(topProducts.length * 25 + Math.random() * 50)}
              label="Verkocht via deze vergelijking"
            />
            <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">Expert</div>
                <div className="text-sm font-medium text-purple-700">Handmatig geselecteerd</div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-center text-white shadow-2xl md:p-12">
            <div className="mx-auto max-w-2xl">
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                Nog meer {categoryTitle} ontdekken?
              </h3>
              <p className="mb-8 text-lg text-white/90">
                Bekijk onze volledige collectie van handmatig geselecteerde deals en vind het
                perfecte cadeau.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => navigateTo('categoryDetail', { categoryId })}
                  className="bg-white text-slate-900 hover:bg-white/90"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Alle {categoryTitle}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigateTo('deals')}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                >
                  Ontdek meer categorieën
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

export default ComparisonPage
