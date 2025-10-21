import React, { useState, useEffect } from 'react'
import { DynamicProductService } from '../services/dynamicProductService'
import { PerformanceInsightsService } from '../services/performanceInsightsService'
import { TrendingUpIcon } from './IconComponents'
import LoadingSpinner from './LoadingSpinner'
import type { ProductMetrics, TrendingProduct } from '../services/performanceInsightsService'
import type { DealItem } from '../types'

const PerformanceInsights: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [trending7d, setTrending7d] = useState<TrendingProduct[]>([])
  const [trending30d, setTrending30d] = useState<TrendingProduct[]>([])
  const [allMetrics, setAllMetrics] = useState<ProductMetrics[]>([])
  const [products, setProducts] = useState<Map<string, DealItem>>(new Map())
  const [period, setPeriod] = useState<7 | 30>(7)
  const [sortBy, setSortBy] = useState<'score' | 'impressions' | 'clicks' | 'ctr'>('score')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load products
      await DynamicProductService.loadProducts()
      const allProducts = DynamicProductService.getProducts()
      const productMap = new Map<string, DealItem>()
      allProducts.forEach((p: any) => {
        productMap.set(p.id, {
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.image || p.imageUrl,
          affiliateLink: p.affiliateLink,
          giftScore: p.giftScore,
          description: p.description || p.shortDescription,
        })
      })
      setProducts(productMap)

      // Load performance data
      const [trending7, trending30, metrics] = await Promise.all([
        PerformanceInsightsService.getTrendingProducts(7, 20),
        PerformanceInsightsService.getTrendingProducts(30, 20),
        PerformanceInsightsService.getAllMetrics(),
      ])

      setTrending7d(trending7)
      setTrending30d(trending30)
      setAllMetrics(metrics)
    } catch (error) {
      console.error('Error loading performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTrending = period === 7 ? trending7d : trending30d

  // Sort trending products
  const sortedTrending = [...currentTrending].sort((a, b) => {
    switch (sortBy) {
      case 'impressions':
        return period === 7
          ? b.impressions7d - a.impressions7d
          : b.impressions30d - a.impressions30d
      case 'clicks':
        return period === 7 ? b.clicks7d - a.clicks7d : b.clicks30d - a.clicks30d
      case 'ctr':
        return period === 7 ? b.ctr7d - a.ctr7d : b.ctr30d - a.ctr30d
      case 'score':
      default:
        return b.score - a.score
    }
  })

  // Calculate summary stats
  const totalImpressions = allMetrics.reduce((sum, m) => sum + m.impressions, 0)
  const totalClicks = allMetrics.reduce((sum, m) => sum + m.clicks, 0)
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const productsWithData = allMetrics.filter((m) => m.impressions > 0).length

  // Top 5 performers by gift score
  const topPerformers = [...currentTrending]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top 5 Presterende Producten - Compact */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-semibold text-gray-700">Top 5 Presterende Producten</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {topPerformers.map((product, index) => {
              const prod = products.get(product.productId)
              return (
                <div
                  key={product.productId}
                  className="bg-white/80 backdrop-blur rounded-lg p-2 border border-gray-200 hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {prod?.name || product.productId}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-semibold text-rose-600">
                          {product.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">👁️</div>
            <div className="text-xs text-blue-600 font-medium">TOTAAL</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Impressies</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">🖱️</div>
            <div className="text-xs text-green-600 font-medium">TOTAAL</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Clicks</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">📊</div>
            <div className="text-xs text-purple-600 font-medium">GEMIDDELD</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{avgCtr.toFixed(2)}%</div>
          <div className="text-sm text-gray-600">CTR</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">🎁</div>
            <div className="text-xs text-orange-600 font-medium">ACTIEF</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{productsWithData}</div>
          <div className="text-sm text-gray-600">Producten</div>
        </div>
      </div>

      {/* Trending Products */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUpIcon className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Trending Producten</h3>
                <p className="text-sm text-gray-600">
                  Populairste producten op basis van recent gedrag
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              🔄 Ververs
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod(7)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 7
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                7 Dagen
              </button>
              <button
                onClick={() => setPeriod(30)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 30
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                30 Dagen
              </button>
            </div>

            <div className="flex-1" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="score">Sorteer op: Score</option>
              <option value="impressions">Sorteer op: Impressies</option>
              <option value="clicks">Sorteer op: Clicks</option>
              <option value="ctr">Sorteer op: CTR</option>
            </select>
          </div>
        </div>

        {/* Trending List */}
        <div className="divide-y divide-gray-200">
          {sortedTrending.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📊</div>
              <p className="text-gray-600">Nog geen performance data beschikbaar</p>
              <p className="text-sm text-gray-500 mt-2">
                Data wordt verzameld zodra producten worden bekeken en geklikt
              </p>
            </div>
          ) : (
            sortedTrending.map((item, index) => {
              const product = products.get(item.productId)
              const impressions = period === 7 ? item.impressions7d : item.impressions30d
              const clicks = period === 7 ? item.clicks7d : item.clicks30d
              const ctr = period === 7 ? item.ctr7d : item.ctr30d

              return (
                <div key={item.productId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 text-center">
                      <div
                        className={`text-lg font-bold ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-gray-400'
                              : index === 2
                                ? 'text-orange-400'
                                : 'text-gray-400'
                        }`}
                      >
                        {index === 0
                          ? '🥇'
                          : index === 1
                            ? '🥈'
                            : index === 2
                              ? '🥉'
                              : `#${index + 1}`}
                      </div>
                    </div>

                    {/* Product Image */}
                    {product && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {product?.name || item.productName}
                      </div>
                      <div className="text-sm text-gray-500">Score: {item.score.toFixed(1)}</div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{impressions}</div>
                        <div className="text-xs text-gray-500">Impressies</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{clicks}</div>
                        <div className="text-xs text-gray-500">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-bold ${
                            ctr > 5
                              ? 'text-green-600'
                              : ctr > 2
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {ctr.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">CTR</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Over Performance Metrics</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <strong>Impressies</strong>: Aantal keer dat een product is getoond
              </p>
              <p>
                • <strong>Clicks</strong>: Aantal keer dat op de affiliate link is geklikt
              </p>
              <p>
                • <strong>CTR</strong>: Click-through rate (clicks / impressies × 100%)
              </p>
              <p>
                • <strong>Score</strong>: Gewogen combinatie van impressies, clicks en CTR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceInsights
