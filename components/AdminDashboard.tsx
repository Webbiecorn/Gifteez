import React, { useEffect, useState } from 'react'
import BlogService from '../services/blogService'
import { DealCategoryConfigService } from '../services/dealCategoryConfigService'
import { DynamicProductService } from '../services/dynamicProductService'
import {
  SparklesIcon,
  TagIcon,
  BookmarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from './IconComponents'
import LoadingSpinner from './LoadingSpinner'

interface DashboardStats {
  blogPosts: {
    total: number
    published: number
    drafts: number
  }
  deals: {
    total: number
    categories: number
    averageScore: number
    lastUpdated: Date | null
  }
  topPerformers: Array<{
    name: string
    score: number
    category: string
  }>
  warnings: string[]
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // Load all data
        await DynamicProductService.loadProducts()
        const [config, blogPosts] = await Promise.all([
          DealCategoryConfigService.load(),
          BlogService.getPosts(),
        ])

        const products = DynamicProductService.getProducts()
        const productStats = DynamicProductService.getStats()

        // Calculate blog stats
        const published = blogPosts.filter((post) => !post.isDraft).length
        const drafts = blogPosts.filter((post) => post.isDraft).length

        // Get top performers
        const topPerformers = products
          .filter((p: any) => p.giftScore && p.giftScore >= 8)
          .sort((a: any, b: any) => (b.giftScore || 0) - (a.giftScore || 0))
          .slice(0, 5)
          .map((p: any) => ({
            name: p.name,
            score: p.giftScore || 0,
            category: p.category || 'Onbekend',
          }))

        // Check for warnings
        const warnings: string[] = []

        // Check empty categories
        if (config?.categories) {
          const emptyCategories = config.categories.filter((cat) => cat.itemIds.length === 0)
          if (emptyCategories.length > 0) {
            warnings.push(
              `${emptyCategories.length} lege categorie${emptyCategories.length > 1 ? 'ën' : ''}`
            )
          }
        }

        // Check if deals need update
        if (productStats?.lastUpdated) {
          const hoursSinceUpdate =
            (Date.now() - productStats.lastUpdated.getTime()) / (1000 * 60 * 60)
          if (hoursSinceUpdate > 24) {
            warnings.push('Deals niet geüpdatet in 24+ uur')
          }
        }

        // Check for low scoring products in categories
        if (config?.categories) {
          const lowScoreCount = config.categories.reduce((count, cat) => {
            const lowScoreItems = cat.itemIds.filter((id) => {
              const product = products.find((p: any) => p.id === id)
              return product && product.giftScore && product.giftScore < 6
            })
            return count + lowScoreItems.length
          }, 0)

          if (lowScoreCount > 0) {
            warnings.push(
              `${lowScoreCount} product${lowScoreCount > 1 ? 'en' : ''} met lage score in categorieën`
            )
          }
        }

        setStats({
          blogPosts: {
            total: blogPosts.length,
            published,
            drafts,
          },
          deals: {
            total: products.length,
            categories: config?.categories?.length || 0,
            averageScore: productStats?.averageGiftScore || 0,
            lastUpdated: productStats?.lastUpdated || null,
          },
          topPerformers,
          warnings,
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner message="Dashboard laden..." />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center p-12 text-gray-600">Kon dashboard gegevens niet laden</div>
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Onbekend'
    return new Date(date).toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-rose-500" />
          Dashboard Overzicht
        </h2>
        <p className="text-gray-600 mt-1">Real-time statistieken en inzichten</p>
      </div>

      {/* Warnings */}
      {stats.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Aandachtspunten</h3>
              <ul className="space-y-1">
                {stats.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-amber-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blog Posts */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <BookmarkIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Blog
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-900">{stats.blogPosts.total}</div>
            <div className="text-sm text-blue-700">Totaal posts</div>
            <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-blue-200">
              <span className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                {stats.blogPosts.published} live
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-amber-600" />
                {stats.blogPosts.drafts} concept
              </span>
            </div>
          </div>
        </div>

        {/* Deals */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <TagIcon className="h-8 w-8 text-rose-600" />
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
              Deals
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-rose-900">{stats.deals.total}</div>
            <div className="text-sm text-rose-700">Beschikbare producten</div>
            <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-rose-200">
              <span>{stats.deals.categories} categorieën</span>
              <span>Ø {stats.deals.averageScore.toFixed(1)} score</span>
            </div>
          </div>
        </div>

        {/* Last Sync */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
              Sync
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-green-900">Laatste update</div>
            <div className="text-xs text-green-700 leading-relaxed">
              {formatDate(stats.deals.lastUpdated)}
            </div>
            <div className="flex items-center gap-2 text-xs mt-3 pt-3 border-t border-green-200">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-green-700">Gesynchroniseerd</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
              Status
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-purple-900">Systeem gezondheid</div>
            <div className="space-y-1 text-xs">
              {stats.warnings.length === 0 ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Alles OK</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <span>
                    {stats.warnings.length} waarschuwing{stats.warnings.length > 1 ? 'en' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUpIcon className="h-5 w-5 text-rose-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Presterende Producten</h3>
        </div>

        {stats.topPerformers.length === 0 ? (
          <p className="text-gray-600 text-sm">Geen top performers beschikbaar</p>
        ) : (
          <div className="space-y-3">
            {stats.topPerformers.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-rose-200 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.category}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold">
                    <SparklesIcon className="h-4 w-4" />
                    {product.score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
