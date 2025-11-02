import React, { useState } from 'react'
import { withAffiliate } from '../services/affiliate'
import { XMarkIcon, CheckIcon, SparklesIcon } from './IconComponents'
import type { DealItem } from '../types'

interface QuickCompareWidgetProps {
  products: DealItem[]
  onClose: () => void
}

const QuickCompareWidget: React.FC<QuickCompareWidgetProps> = ({ products, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState<DealItem[]>([])

  const toggleProduct = (product: DealItem) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const isSelected = (product: DealItem) => selectedProducts.some((p) => p.id === product.id)

  const getFeatures = (product: DealItem) => {
    const features: string[] = []
    if (product.giftScore && product.giftScore >= 9) features.push('Top beoordeeld')
    if (product.isOnSale) features.push('In de sale')
    if (product.originalPrice) features.push('Korting')
    // Add more dynamic features based on your data structure
    return features
  }

  const handleCompare = () => {
    if (window.gtag) {
      window.gtag('event', 'product_comparison', {
        event_category: 'engagement',
        items: selectedProducts.map((p) => p.name).join(', '),
        count: selectedProducts.length,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Snelle Vergelijking</h3>
                    <p className="text-sm text-slate-600">
                      Selecteer tot 3 producten om te vergelijken
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Product Selection */}
            <div className="p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    disabled={!isSelected(product) && selectedProducts.length >= 3}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                      isSelected(product)
                        ? 'border-rose-500 bg-rose-50 shadow-lg'
                        : selectedProducts.length >= 3
                          ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-rose-300 hover:shadow-md'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected(product) && (
                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                        <CheckIcon className="h-5 w-5" />
                      </div>
                    )}

                    <div className="mb-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    </div>
                    <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-rose-600">
                        {product.price || '€--'}
                      </span>
                      {product.giftScore && (
                        <span className="text-sm font-semibold text-slate-600">
                          ⭐ {product.giftScore}/10
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Comparison Table */}
              {selectedProducts.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Eigenschap
                        </th>
                        {selectedProducts.map((product) => (
                          <th
                            key={product.id}
                            className="px-4 py-3 text-center text-sm font-semibold text-slate-700"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="mx-auto mb-2 h-16 w-16 rounded-lg object-cover"
                            />
                            <div className="line-clamp-2 text-xs">{product.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 bg-white">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">Prijs</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="px-4 py-3 text-center">
                            <span className="font-bold text-rose-600">
                              {product.price || 'N/A'}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                          Cadeauscore
                        </td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="px-4 py-3 text-center">
                            {product.giftScore ? (
                              <span className="font-semibold text-slate-900">
                                {product.giftScore}/10
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200 bg-white">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">Kenmerken</td>
                        {selectedProducts.map((product) => {
                          const features = getFeatures(product)
                          return (
                            <td key={product.id} className="px-4 py-3">
                              <div className="space-y-1">
                                {features.length > 0 ? (
                                  features.map((feature, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-center gap-1 text-xs text-slate-700"
                                    >
                                      <CheckIcon className="h-3 w-3 text-emerald-600" />
                                      <span>{feature}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">Geen data</span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">Actie</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="px-4 py-3 text-center">
                            <a
                              href={withAffiliate(product.affiliateLink, {
                                pageType: 'comparison',
                                placement: 'quick-compare-cta',
                              })}
                              target="_blank"
                              rel="sponsored nofollow noopener noreferrer"
                              onClick={handleCompare}
                              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                            >
                              <span>Bekijk</span>
                              <svg
                                className="h-3 w-3"
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
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {selectedProducts.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                    <SparklesIcon className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-slate-600">
                    Selecteer producten hierboven om ze te vergelijken
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickCompareWidget
