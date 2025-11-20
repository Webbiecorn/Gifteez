import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBlogContext } from '../contexts/BlogContext'
import { logger } from '../lib/logger'
import { withAffiliate } from '../services/affiliate'
import BlogService from '../services/blogService'
import { DealCategoryConfigService } from '../services/dealCategoryConfigService'
import { DynamicProductService } from '../services/dynamicProductService'
import { firebaseEnabled } from '../services/firebase'
import ActivityLog from './ActivityLog'
import AdminContactMessages from './AdminContactMessages'
import AdminDashboard from './AdminDashboard'
import AdminNewsletterPanel from './AdminNewsletterPanel'
import BlogEditor from './BlogEditor'
import { BulkProductImporter } from './BulkProductImporter'
import Button from './Button'
import DealCategoryManager from './DealCategoryManager'
import {
  SparklesIcon,
  TagIcon,
  GiftIcon,
  SearchIcon,
  TargetIcon,
  CheckIcon,
  StarIcon,
  LinkIcon,
  SpinnerIcon,
  DownloadIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  CheckCircleIcon,
  XCircleIcon,
} from './IconComponents'
import ImageValidator from './ImageValidator'
import ImageWithFallback from './ImageWithFallback'
import PerformanceInsights from './PerformanceInsights'
import ProductPostWizard from './ProductPostWizard'
import type { BlogPostData } from '../services/blogService'
import type { NavigateTo, DealItem, DealCategory } from '../types'

const ADMIN_PREFERENCES_STORAGE_KEY = 'gifteez.admin.preferences.v1'

type AdminTab =
  | 'overview'
  | 'blog'
  | 'deals'
  | 'newsletter'
  | 'messages'
  | 'settings'
  | 'activity'
  | 'performance'
  | 'import'
  | 'images'

interface AdminPreferences {
  defaultTab: AdminTab
}

const defaultAdminPreferences: AdminPreferences = {
  defaultTab: 'overview',
}

const ADMIN_EMAILS = [
  'admin@gifteez.nl',
  'kevin@gifteez.nl',
  'beheer@gifteez.nl',
  'test@gifteez.nl',
]

const hasWindow = typeof window !== 'undefined'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim()
    if (message) {
      return message
    }
  }

  return fallback
}

const logUnknownError = (
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (error instanceof Error) {
    logger.error(message, {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    })
    return
  }

  logger.error(message, { ...context, error })
}

const logUnknownWarning = (
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (error instanceof Error) {
    logger.warn(message, {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    })
    return
  }

  logger.warn(message, { ...context, error })
}

const confirmAction = (message: string): boolean => {
  if (hasWindow && typeof window.confirm === 'function') {
    return window.confirm(message)
  }
  logger.warn('Confirm skipped (no window available)', { message })
  return true
}

type DealsStatus = { type: 'success' | 'error' | 'info'; message: string } | null

const handleAdminOpschonen = async (
  setStatus: React.Dispatch<React.SetStateAction<DealsStatus>>,
  setCategories: React.Dispatch<React.SetStateAction<DealCategory[]>>
): Promise<void> => {
  setStatus({ type: 'info', message: 'Bezig met opschonen…' })
  try {
    if (typeof DealCategoryConfigService.clearAll === 'function') {
      await DealCategoryConfigService.clearAll()
    }
    setCategories([])
    setStatus({ type: 'success', message: 'Admin en backend zijn opgeschoond.' })
  } catch (error: unknown) {
    logUnknownError('Opschonen mislukt', error, { scope: 'admin.deals.cleanup' })
    const message = getErrorMessage(error, 'Opschonen mislukt.')
    setStatus({ type: 'error', message })
  }
}

const getStoredAdminPreferences = (): AdminPreferences => {
  if (typeof window === 'undefined') {
    return defaultAdminPreferences
  }

  try {
    const stored = window.localStorage.getItem(ADMIN_PREFERENCES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AdminPreferences>
      return {
        defaultTab: (parsed.defaultTab as AdminTab) ?? defaultAdminPreferences.defaultTab,
      }
    }
  } catch (error: unknown) {
    logUnknownWarning('Kon admin voorkeuren niet laden', error, {
      scope: 'admin.preferences.load',
    })
  }

  return defaultAdminPreferences
}

interface AdminPageProps {
  navigateTo: NavigateTo
}

const AdminPage: React.FC<AdminPageProps> = ({ navigateTo }) => {
  const auth = useAuth()
  const [adminPreferences, setAdminPreferences] = useState<AdminPreferences>(() =>
    getStoredAdminPreferences()
  )
  const [activeTab, setActiveTab] = useState<AdminTab>(adminPreferences.defaultTab)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const updateAdminPreferences = useCallback((patch: Partial<AdminPreferences>) => {
    setAdminPreferences((previous) => {
      const next = { ...previous, ...patch }
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(ADMIN_PREFERENCES_STORAGE_KEY, JSON.stringify(next))
        } catch (error: unknown) {
          logUnknownWarning('Kon admin voorkeuren niet opslaan', error, {
            scope: 'admin.preferences.save',
          })
        }
      }
      return next
    })

    if (patch.defaultTab) {
      setActiveTab(patch.defaultTab)
    }
  }, [])

  useEffect(() => {
    if (auth && auth.currentUser && auth.currentUser.email) {
      const normalizedEmail = auth.currentUser.email.toLowerCase()
      setIsAuthorized(ADMIN_EMAILS.includes(normalizedEmail))
    }
  }, [auth])

  if (!auth || !auth.currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Login Vereist</h1>
            <p className="text-gray-600 mb-6">
              Je moet ingelogd zijn om het admin panel te gebruiken.
            </p>
            <button
              onClick={() => navigateTo('login')}
              className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg hover:bg-rose-600 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Geen Toegang</h1>
            <p className="text-gray-600 mb-4">
              Je hebt geen admin rechten. Alleen geautoriseerde gebruikers kunnen het admin panel
              gebruiken.
            </p>
            <p className="text-sm text-gray-500 mb-6">Ingelogd als: {auth.currentUser.email}</p>
            <button
              onClick={() => navigateTo('home')}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition"
            >
              Terug naar Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateTo('home')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Terug naar Site
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gifteez Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welkom, {auth.currentUser.name || auth.currentUser.email}
              </span>
              <button
                onClick={() => auth.logout()}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Primary tabs */}
            <nav className="flex flex-wrap gap-4 lg:gap-6">
              {[
                { key: 'overview', label: 'Overzicht', icon: '📊' },
                { key: 'blog', label: 'Blog Posts', icon: '📝' },
                { key: 'deals', label: 'Deals', icon: '🏷️' },
                { key: 'newsletter', label: 'Nieuwsbrief', icon: '📧' },
                { key: 'messages', label: 'Berichten', icon: '📨' },
                { key: 'settings', label: 'Instellingen', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as AdminTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Advanced tabs */}
            <div className="mt-2 lg:mt-0 flex items-center gap-2 text-xs text-gray-500">
              <span className="hidden sm:inline">Geavanceerd:</span>
              <nav className="flex flex-wrap gap-3">
                {[
                  { key: 'import', label: 'Bulk Import', icon: '📦' },
                  { key: 'images', label: 'Images', icon: '🖼️' },
                  { key: 'activity', label: 'Activiteiten', icon: '📋' },
                  { key: 'performance', label: 'Performance', icon: '📈' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as AdminTab)}
                    className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-rose-300 text-rose-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <AdminDashboard />}
        {activeTab === 'blog' && <BlogAdmin isCloudConnected={firebaseEnabled} />}
        {activeTab === 'deals' && <DealsAdmin />}
        {activeTab === 'newsletter' && <AdminNewsletterPanel />}
        {activeTab === 'messages' && <AdminContactMessages />}
        {activeTab === 'import' && <BulkProductImporter />}
        {activeTab === 'images' && <ImageValidator />}
        {activeTab === 'activity' && <ActivityLog />}
        {activeTab === 'performance' && <PerformanceInsights />}
        {activeTab === 'settings' && (
          <SettingsAdmin
            adminEmails={ADMIN_EMAILS.slice()}
            firebaseEnabled={firebaseEnabled}
            navigateTo={navigateTo}
            onSelectTab={(tab) => setActiveTab(tab)}
            onUpdatePreferences={updateAdminPreferences}
            preferences={adminPreferences}
          />
        )}
      </div>
    </div>
  )
}

// Blog Admin Component
interface BlogAdminProps {
  isCloudConnected: boolean
}

const countWords = (value?: string) => {
  if (!value) {
    return 0
  }
  return value.trim().split(/\s+/).filter(Boolean).length
}

const BlogAdmin: React.FC<BlogAdminProps> = ({ isCloudConnected }) => {
  const [showEditor, setShowEditor] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | undefined>()
  const [editingPost, setEditingPost] = useState<BlogPostData | null>(null)
  const [allPosts, setAllPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductWizard, setShowProductWizard] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [workingPostId, setWorkingPostId] = useState<string | null>(null)
  const { refresh } = useBlogContext()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedPosts = await BlogService.getPosts(true)
      setAllPosts(fetchedPosts)
      await refresh()
    } catch (error: unknown) {
      logUnknownError('Error loading posts', error, { scope: 'admin.blog.loadPosts' })
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Kon blogposts niet laden.'),
      })
    } finally {
      setLoading(false)
    }
  }, [refresh])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const handleCreatePost = () => {
    setEditingPostId(undefined)
    setEditingPost(null)
    setShowEditor(true)
  }

  const handleEditPost = (post: BlogPostData) => {
    setEditingPostId(post.id)
    setEditingPost(post)
    setShowEditor(true)
  }

  const handleCloseEditor = async () => {
    setShowEditor(false)
    setEditingPostId(undefined)
    setEditingPost(null)
    await loadPosts()
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!id) return
    if (!confirmAction(`Weet je zeker dat je "${title}" wilt verwijderen?`)) {
      return
    }

    setWorkingPostId(id)
    try {
      await BlogService.deletePost(id)

      // Update local state immediately for instant UI feedback
      setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))

      // Then refresh the context to ensure consistency across the app
      await refresh()

      setStatus({ type: 'success', message: `"${title}" verwijderd.` })
    } catch (error: unknown) {
      logUnknownError('Kon blogpost niet verwijderen', error, {
        scope: 'admin.blog.deletePost',
        postId: id,
      })
      setStatus({ type: 'error', message: getErrorMessage(error, 'Verwijderen mislukt.') })
      // Reload posts to restore correct state if delete failed
      await loadPosts()
    } finally {
      setWorkingPostId(null)
    }
  }

  const handlePublishPost = async (id: string, title: string) => {
    if (!id) return
    if (!isCloudConnected) {
      setStatus({
        type: 'error',
        message: 'Publiceren is alleen beschikbaar wanneer Firebase gekoppeld is.',
      })
      return
    }

    if (!confirmAction(`"${title}" publiceren naar de live site?`)) {
      return
    }

    setWorkingPostId(id)
    try {
      await BlogService.publishPost(id)
      setStatus({ type: 'success', message: `"${title}" gepubliceerd!` })
      await loadPosts()
    } catch (error: unknown) {
      logUnknownError('Kon blogpost niet publiceren', error, {
        scope: 'admin.blog.publishPost',
        postId: id,
      })
      setStatus({ type: 'error', message: getErrorMessage(error, 'Publiceren mislukt.') })
    } finally {
      setWorkingPostId(null)
    }
  }

  const handleProductTemplateReady = (template: BlogPostData) => {
    setShowProductWizard(false)
    setEditingPostId(undefined)
    setEditingPost(template)
    setShowEditor(true)
  }

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>()
    allPosts.forEach((post) => {
      if (post.category) {
        unique.add(post.category)
      }
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'nl-NL'))
  }, [allPosts])

  const filteredPosts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return allPosts.filter((post) => {
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'draft' ? post.isDraft : !post.isDraft

      const matchesCategory = categoryFilter === 'all' ? true : post.category === categoryFilter

      const matchesSearch =
        search.length === 0
          ? true
          : `${post.title} ${post.slug} ${post.excerpt ?? ''}`.toLowerCase().includes(search)

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [allPosts, categoryFilter, statusFilter, searchTerm])

  const analytics = useMemo(() => {
    if (!allPosts.length) {
      return {
        total: 0,
        published: 0,
        drafts: 0,
        missingHero: 0,
        missingSeo: 0,
        avgWords: 0,
      }
    }

    let published = 0
    let missingHero = 0
    let missingSeo = 0
    let totalWords = 0

    allPosts.forEach((post) => {
      if (!post.isDraft) {
        published += 1
      }
      if (!post.imageUrl) {
        missingHero += 1
      }
      const hasSeo = Boolean(post.seo?.metaTitle?.trim() || post.seo?.metaDescription?.trim())
      if (!hasSeo) {
        missingSeo += 1
      }
      totalWords += countWords(post.content)
    })

    const total = allPosts.length
    const drafts = total - published
    const avgWords = total ? Math.round(totalWords / Math.max(total, 1)) : 0

    return { total, published, drafts, missingHero, missingSeo, avgWords }
  }, [allPosts])

  const isFiltered =
    categoryFilter !== 'all' || statusFilter !== 'all' || Boolean(searchTerm.trim())

  const resetFilters = () => {
    setStatusFilter('all')
    setCategoryFilter('all')
    setSearchTerm('')
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Blogposts beheren</h2>
              <p className="text-sm text-gray-500">
                Maak, bewerk en publiceer blogposts.{' '}
                {isCloudConnected
                  ? 'Verbonden met Firebase.'
                  : 'Offline modus: wijzigingen worden lokaal opgeslagen.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/blog-editor-instructies.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-500 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
              >
                Handleiding (PDF)
              </a>
              <button
                onClick={() => setShowProductWizard(true)}
                className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
              >
                Productpost genereren
              </button>
              <button
                onClick={handleCreatePost}
                className="inline-flex items-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                Nieuwe post
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isCloudConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {isCloudConnected ? 'Live gekoppeld' : 'Lokale concepten'}
              </span>
              <span>{filteredPosts.length} posts zichtbaar</span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  Filters wissen
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Zoek op titel of slug..."
                  className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value === 'all' ? 'all' : e.target.value)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="all">Alle categorieën</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600">
                {[
                  { key: 'all' as const, label: 'Alles' },
                  { key: 'published' as const, label: 'Live' },
                  { key: 'draft' as const, label: 'Concepten' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatusFilter(option.key)}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      statusFilter === option.key
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => void loadPosts()}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600"
              >
                Opnieuw laden
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Totaal</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{analytics.total}</p>
              <p className="text-xs text-gray-500">Blogposts in beheer</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Live</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{analytics.published}</p>
              <p className="text-xs text-emerald-600">Zichtbaar op de site</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Concepten
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">{analytics.drafts}</p>
              <p className="text-xs text-amber-600">Nog niet gepubliceerd</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                Hero ontbreekt
              </p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">{analytics.missingHero}</p>
              <p className="text-xs text-rose-500">Voeg een hero-afbeelding toe</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                SEO actie
              </p>
              <p className="mt-1 text-2xl font-semibold text-blue-700">{analytics.missingSeo}</p>
              <p className="text-xs text-blue-600">Meta-gegevens missen</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Gem. lengte
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{analytics.avgWords}</p>
              <p className="text-xs text-gray-500">Woorden per post</p>
            </div>
          </div>

          {status && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                Blogposts laden...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPosts.map((post) => {
                    const publishedLabel = post.isDraft ? 'Concept' : 'Gepubliceerd'
                    const publishedClass = post.isDraft
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600'
                    const publishedDate = post.publishedDate
                      ? new Date(post.publishedDate).toLocaleDateString('nl-NL')
                      : 'onbekend'
                    const postId = post.id
                    const isBusy = postId ? workingPostId === postId : false
                    const hasHero = Boolean(post.imageUrl)
                    const hasSeo = Boolean(
                      post.seo?.metaTitle?.trim() || post.seo?.metaDescription?.trim()
                    )
                    const wordCount = countWords(post.content)
                    const readMinutes = Math.max(1, Math.round(wordCount / 220))

                    return (
                      <div
                        key={post.id ?? post.slug}
                        className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-400">/{post.slug}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${publishedClass}`}
                          >
                            {publishedLabel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.excerpt || 'Nog geen samenvatting toegevoegd.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                              hasHero
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {hasHero ? '✅ Hero' : '⚠️ Hero ontbreekt'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                              hasSeo ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {hasSeo ? 'SEO klaar' : 'SEO aanvullen'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                            ⏱️ {readMinutes} min · {wordCount} w
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span>Geüpdatet: {publishedDate}</span>
                            {post.category && <span>Categorie: {post.category}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              Bewerken
                            </button>
                            {post.isDraft && postId && (
                              <button
                                onClick={() => handlePublishPost(postId, post.title)}
                                disabled={isBusy}
                                className={`font-medium ${isBusy ? 'text-gray-400' : 'text-green-600 hover:text-green-800'}`}
                              >
                                {isBusy ? 'Bezig...' : 'Publiceren'}
                              </button>
                            )}
                            {postId && (
                              <button
                                onClick={() => handleDeletePost(postId, post.title)}
                                disabled={isBusy}
                                className={`font-medium ${isBusy ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}
                              >
                                Verwijderen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {filteredPosts.length === 0 && !loading && (
                  <div className="py-12 text-center text-gray-500">
                    <div className="mb-4 text-4xl">📝</div>
                    <h3 className="mb-2 text-lg font-medium">Geen blogposts gevonden</h3>
                    {allPosts.length === 0 ? (
                      <p>Klik op "Nieuwe post" om je eerste blogpost te maken.</p>
                    ) : (
                      <p>Pas je filters aan of wis ze om andere posts te zien.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ProductPostWizard
        isOpen={showProductWizard}
        onCancel={() => setShowProductWizard(false)}
        onGenerate={handleProductTemplateReady}
      />
      {showEditor && (
        <BlogEditor postId={editingPostId} initialPost={editingPost} onClose={handleCloseEditor} />
      )}
    </>
  )
}

const DealsAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dealOfWeek, setDealOfWeek] = useState<DealItem | null>(null)
  const [topDeals, setTopDeals] = useState<DealItem[]>([])
  const [categories, setCategories] = useState<DealCategory[]>([])
  const [dealsView, setDealsView] = useState<'overview' | 'categories'>('overview')
  const [stats, setStats] = useState<{
    totalProducts: number
    lastUpdated: Date | null
    averageGiftScore: number
    priceRanges: { budget: number; midRange: number; premium: number }
  } | null>(null)
  const [status, setStatus] = useState<DealsStatus>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<DealItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'premium'>('all')
  const [isCopying, setIsCopying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const loadDeals = useCallback(async (showSuccessMessage = false) => {
    setLoading(true)
    try {
      const [weekly, top, categoryData] = await Promise.all([
        DynamicProductService.getDealOfTheWeek(),
        DynamicProductService.getTop10Deals(),
        DynamicProductService.getDealCategories(),
      ])

      setDealOfWeek(weekly)
      setTopDeals(top)
      setCategories(categoryData)
      setStats(DynamicProductService.getStats())
      if (showSuccessMessage) {
        setStatus({ type: 'success', message: 'Deals vernieuwd met actuele feed.' })
      } else {
        setStatus(null)
      }
    } catch (error: unknown) {
      logUnknownError('Kon deals niet laden', error, { scope: 'admin.deals.loadDeals' })
      setStatus({
        type: 'error',
        message: getErrorMessage(
          error,
          'Kon deals niet laden. Controleer de productfeed of probeer opnieuw.'
        ),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDeals()
  }, [loadDeals])

  const formatDateTime = useCallback((value?: Date | null) => {
    if (!value) {
      return 'Onbekend'
    }
    try {
      return new Date(value).toLocaleString('nl-NL', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (error: unknown) {
      logUnknownWarning('Kon datum niet formatteren', error, {
        scope: 'admin.deals.formatDate',
        value,
      })
      return 'Onbekend'
    }
  }, [])

  const copyToClipboard = useCallback(async (text: string, successMessage: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.top = '-1000px'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setStatus({ type: 'success', message: successMessage })
    } catch (error: unknown) {
      logUnknownError('Kopiëren naar klembord mislukt', error, {
        scope: 'admin.deals.copyToClipboard',
      })
      setStatus({ type: 'error', message: 'Kopiëren naar klembord mislukt.' })
    }
  }, [])

  const createDealSnippet = useCallback((deal: DealItem) => {
    const lines = [
      `**${deal.name}**`,
      deal.description,
      deal.price ? `Prijs: ${deal.price}` : null,
      deal.originalPrice ? `Oorspronkelijke prijs: ${deal.originalPrice}` : null,
      deal.giftScore ? `Cadeauscore: ${deal.giftScore}/10` : null,
      deal.affiliateLink ? `Link: ${withAffiliate(deal.affiliateLink)}` : null,
    ]

    return lines.filter(Boolean).join('\n')
  }, [])

  // Stub functions for removed pinned deals feature (pins are deprecated)
  const isDealPinned = useCallback((_deal: DealItem) => false, [])
  const togglePinDeal = useCallback((_deal: DealItem) => {}, [])

  const handleCopyDeal = useCallback(
    async (deal: DealItem) => {
      await copyToClipboard(
        createDealSnippet(deal),
        `${deal.name} is gekopieerd naar het klembord.`
      )
    },
    [copyToClipboard, createDealSnippet]
  )

  const handleCopyDigest = useCallback(async () => {
    if (!dealOfWeek && !topDeals.length && !categories.length) {
      setStatus({ type: 'error', message: 'Er zijn geen deals om te kopiëren.' })
      return
    }

    setIsCopying(true)
    try {
      const digest: string[] = []
      digest.push('# Gifteez Dealoverzicht')
      if (dealOfWeek) {
        digest.push('\n## 🔥 Deal van de week')
        digest.push(createDealSnippet(dealOfWeek))
      }

      if (topDeals.length) {
        digest.push('\n## ⭐ Top 5 snelle tips')
        topDeals.slice(0, 5).forEach((deal, index) => {
          digest.push(
            `${index + 1}. ${deal.name} — ${deal.price} — ${withAffiliate(deal.affiliateLink)}`
          )
        })
      }

      if (categories.length) {
        digest.push('\n## 📦 Categorie highlights')
        categories.forEach((category) => {
          const highlights = category.items
            .slice(0, 3)
            .map((item) => item.name)
            .join(', ')
          digest.push(`- ${category.title}: ${highlights}`)
        })
      }

      if (stats) {
        const safeAverageScore = Number.isFinite(stats.averageGiftScore)
          ? stats.averageGiftScore
          : 0
        digest.push('\n## ℹ️ Feed statistieken')
        digest.push(`Totaal producten in feed: ${stats.totalProducts}`)
        digest.push(`Gemiddelde cadeauscore: ${safeAverageScore.toFixed(1)}`)
        digest.push(
          `Verdeling prijsrange — Budget: ${stats.priceRanges.budget}, Mid-range: ${stats.priceRanges.midRange}, Premium: ${stats.priceRanges.premium}`
        )
      }

      digest.push(`\nLaatste update: ${formatDateTime(stats?.lastUpdated ?? new Date())}`)

      await copyToClipboard(digest.join('\n'), 'Weekoverzicht gekopieerd.')
    } finally {
      setIsCopying(false)
    }
  }, [categories, copyToClipboard, createDealSnippet, dealOfWeek, formatDateTime, stats, topDeals])

  const uniqueTopDeals = useMemo(() => {
    const seen = new Set<string>()
    return topDeals.filter((deal) => {
      if (seen.has(deal.id)) return false
      seen.add(deal.id)
      return true
    })
  }, [topDeals])

  const uniqueSearchResults = useMemo(() => {
    const seen = new Set<string>()
    return searchResults.filter((deal) => {
      if (seen.has(deal.id)) return false
      seen.add(deal.id)
      return true
    })
  }, [searchResults])

  const handleExportAnalytics = useCallback(() => {
    if (typeof window === 'undefined') {
      setStatus({ type: 'error', message: 'Exporteerfunctie is alleen beschikbaar in de browser.' })
      return
    }

    const dataset = new Map<string, { segment: string; deal: DealItem; pinned: boolean }>()

    const addDealToDataset = (deal: DealItem | null | undefined, segment: string) => {
      if (!deal || dataset.has(deal.id)) {
        return
      }
      dataset.set(deal.id, {
        segment,
        deal,
        pinned: isDealPinned(deal),
      })
    }

    addDealToDataset(dealOfWeek, 'Deal van de week')
    uniqueTopDeals.forEach((deal, index) => addDealToDataset(deal, `Topdeal #${index + 1}`))
    categories.forEach((category) => {
      category.items.forEach((item) => addDealToDataset(item, `Categorie: ${category.title}`))
    })

    if (dataset.size === 0) {
      setStatus({ type: 'error', message: 'Geen deals beschikbaar om te exporteren.' })
      return
    }

    setIsExporting(true)
    try {
      const headers = [
        'segment',
        'naam',
        'prijs',
        'cadeauscore',
        'op_aanbieding',
        'affiliate_url',
        'tags',
        'vastgezet',
      ]
      const rows = [headers]

      dataset.forEach(({ segment, deal, pinned }) => {
        const giftScoreValue =
          typeof deal.giftScore === 'number' && Number.isFinite(deal.giftScore)
            ? deal.giftScore.toFixed(1)
            : ''
        const tagsValue = Array.isArray(deal.tags) ? deal.tags.join('|') : ''
        const affiliateUrl = deal.affiliateLink ? withAffiliate(deal.affiliateLink) : ''

        rows.push([
          segment,
          deal.name,
          deal.price ?? '',
          giftScoreValue,
          deal.isOnSale ? 'ja' : 'nee',
          affiliateUrl,
          tagsValue,
          pinned ? 'ja' : 'nee',
        ])
      })

      if (stats) {
        const blankRow = new Array(headers.length).fill('')
        rows.push(blankRow)
        rows.push([
          'statistieken',
          'totaal_producten',
          String(stats.totalProducts),
          '',
          '',
          '',
          '',
          '',
        ])
        rows.push([
          'statistieken',
          'gemiddelde_cadeauscore',
          stats.averageGiftScore ? stats.averageGiftScore.toFixed(2) : '',
          '',
          '',
          '',
          '',
          '',
        ])
        rows.push([
          'statistieken',
          'prijsverdeling_budget',
          String(stats.priceRanges.budget),
          '',
          '',
          '',
          '',
          '',
        ])
        rows.push([
          'statistieken',
          'prijsverdeling_midrange',
          String(stats.priceRanges.midRange),
          '',
          '',
          '',
          '',
          '',
        ])
        rows.push([
          'statistieken',
          'prijsverdeling_premium',
          String(stats.priceRanges.premium),
          '',
          '',
          '',
          '',
          '',
        ])
        rows.push([
          'statistieken',
          'laatste_update',
          stats.lastUpdated ? formatDateTime(stats.lastUpdated) : 'Onbekend',
          '',
          '',
          '',
          '',
          '',
        ])
      }

      const escapeCell = (value: string) => {
        const normalised = value?.toString() ?? ''
        const needsEscaping = /[";\n]/.test(normalised)
        const escaped = normalised.replace(/"/g, '""')
        return needsEscaping ? `"${escaped}"` : escaped
      }

      const csvContent = rows.map((row) => row.map(escapeCell).join(';')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      link.href = url
      link.setAttribute('download', `gifteez-deals-export-${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setStatus({ type: 'success', message: 'CSV-export aangemaakt en gedownload.' })
    } catch (error: unknown) {
      logUnknownError('Kon export niet genereren', error, { scope: 'admin.deals.export' })
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Exporteren mislukt. Probeer het opnieuw.'),
      })
    } finally {
      setIsExporting(false)
    }
  }, [categories, dealOfWeek, formatDateTime, setStatus, stats, uniqueTopDeals])

  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim()
    if (!term) {
      setSearchResults([])
      setPriceFilter('all')
      return
    }

    setIsSearching(true)
    setPriceFilter('all')
    try {
      const results = await DynamicProductService.searchProducts(term, 18)
      setSearchResults(results)
    } catch (error: unknown) {
      logUnknownError('Zoekopdracht mislukt', error, { scope: 'admin.deals.search' })
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Zoekopdracht mislukt. Probeer een andere term.'),
      })
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm])

  const handlePriceShortcut = useCallback(
    async (range: 'all' | 'budget' | 'mid' | 'premium') => {
      setPriceFilter(range)
      setSearchTerm('')
      setIsSearching(true)
      try {
        if (range === 'all') {
          setSearchResults(topDeals)
          setStatus({ type: 'info', message: 'Toont huidige Top 10 deals.' })
          return
        }

        let min = 0
        let max = 9999
        if (range === 'budget') {
          max = 50
        } else if (range === 'mid') {
          min = 50
          max = 150
        } else if (range === 'premium') {
          min = 150
          max = 1500
        }

        const results = await DynamicProductService.getProductsByPriceRange(min, max, 18)
        setSearchResults(results)
        setStatus({ type: 'info', message: `Gefilterd op prijsrange ${range}.` })
      } catch (error: unknown) {
        logUnknownError('Kon prijsfilter niet toepassen', error, {
          scope: 'admin.deals.priceFilter',
          range,
        })
        setStatus({
          type: 'error',
          message: getErrorMessage(error, 'Kon prijsfilter niet toepassen.'),
        })
      } finally {
        setIsSearching(false)
      }
    },
    // isDealPinned is a stub function with no deps, safe to omit

    [topDeals]
  )

  const refreshDeals = useCallback(async () => {
    setStatus({ type: 'info', message: 'Deals opnieuw samenstellen…' })
    await loadDeals(true)
  }, [loadDeals])

  const safeAverageScore =
    stats && Number.isFinite(stats.averageGiftScore) ? stats.averageGiftScore : 0

  const priceFilterLabels: Record<'all' | 'budget' | 'mid' | 'premium', string> = {
    all: 'Alle prijzen',
    budget: 'Budget (< €50)',
    mid: 'Mid-range (€50-€150)',
    premium: 'Premium (> €150)',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">Deals beheer</h2>
        <Button variant="danger" onClick={() => handleAdminOpschonen(setStatus, setCategories)}>
          Admin & backend opschonen
        </Button>
      </div>
      {/* Sub-navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setDealsView('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              dealsView === 'overview'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Deals Overzicht
          </button>
          <button
            onClick={() => setDealsView('categories')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              dealsView === 'categories'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 Categorieën Beheren
          </button>
        </div>
      </div>

      {/* Category Manager View */}
      {dealsView === 'categories' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DealCategoryManager onSaved={() => loadDeals(true)} />
        </div>
      )}

      {/* Overview View */}
      {dealsView === 'overview' && (
        <>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-600">
                  <SparklesIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    Live deals dashboard
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">Deals beheren</h2>
                <p className="text-sm text-gray-500">
                  Bekijk en curate de huidige deals, kopieer snippets voor nieuwsbrieven en ontdek
                  extra producten uit de feed.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={refreshDeals}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                >
                  <TagIcon className="h-4 w-4" aria-hidden="true" />
                  Vernieuw deals
                </button>
                <Button
                  type="button"
                  variant="accent"
                  disabled={isCopying}
                  className={`flex items-center gap-2 py-2 text-sm ${isCopying ? 'opacity-75' : ''}`}
                  onClick={handleCopyDigest}
                >
                  <GiftIcon className="h-4 w-4" aria-hidden="true" />
                  {isCopying ? 'Kopiëren…' : 'Weekoverzicht kopiëren'}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={isExporting}
                  className={`flex items-center gap-2 py-2 text-sm ${isExporting ? 'opacity-75' : ''}`}
                  onClick={handleExportAnalytics}
                >
                  <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                  {isExporting ? 'Exporteren…' : 'CSV export'}
                </Button>
              </div>
            </div>

            {stats && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Producten in feed
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Laatste update: {formatDateTime(stats.lastUpdated)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Gem. cadeauscore
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                    <p className="text-2xl font-semibold text-emerald-700">
                      {safeAverageScore.toFixed(1)}
                    </p>
                  </div>
                  <p className="text-xs text-emerald-600">Hoger is beter</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Prijsverdeling
                  </p>
                  <p className="mt-2 text-sm text-gray-700">Budget: {stats.priceRanges.budget}</p>
                  <p className="text-sm text-gray-700">Mid-range: {stats.priceRanges.midRange}</p>
                  <p className="text-sm text-gray-700">Premium: {stats.priceRanges.premium}</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Highlights
                  </p>
                  <p className="mt-2 text-sm text-gray-700">Top deals: {uniqueTopDeals.length}</p>
                  <p className="text-sm text-gray-700">Categorieën: {categories.length}</p>
                  <p className="text-sm text-gray-700">
                    Zoekresultaten: {uniqueSearchResults.length}
                  </p>
                </div>
              </div>
            )}

            {status && (
              <div
                className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
                  status.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : status.type === 'info'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {status.message}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr] lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <SparklesIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Deal van de week</h3>
                    <p className="text-xs text-gray-500">
                      Automatisch gekozen uit Coolblue/Amazon feed op basis van score, prijs en
                      sale-status.
                    </p>
                  </div>
                </div>
                {loading && !dealOfWeek ? (
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Deal van de week laden…
                  </div>
                ) : dealOfWeek ? (
                  <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-rose-50/60 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="w-full overflow-hidden rounded-xl bg-white shadow lg:w-1/3">
                        <ImageWithFallback
                          src={dealOfWeek.imageUrl}
                          alt={dealOfWeek.name}
                          className="aspect-square"
                          fit="contain"
                          showSkeleton
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-2xl font-semibold text-gray-900">
                            {dealOfWeek.name}
                          </h4>
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                            {dealOfWeek.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">
                            <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {dealOfWeek.price}
                          </span>
                          {dealOfWeek.originalPrice && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                              <s>{dealOfWeek.originalPrice}</s>
                            </span>
                          )}
                          {dealOfWeek.giftScore && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                              <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              Cadeauscore {dealOfWeek.giftScore}/10
                            </span>
                          )}
                          {isDealPinned(dealOfWeek) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                              <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              Vastgezet
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={withAffiliate(dealOfWeek.affiliateLink)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
                          >
                            <LinkIcon className="h-4 w-4" aria-hidden="true" />
                            Open product
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              void handleCopyDeal(dealOfWeek)
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            <GiftIcon className="h-4 w-4" aria-hidden="true" />
                            Kopieer snippet
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePinDeal(dealOfWeek)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                              isDealPinned(dealOfWeek)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {isDealPinned(dealOfWeek) ? (
                              <BookmarkFilledIcon className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <BookmarkIcon className="h-4 w-4" aria-hidden="true" />
                            )}
                            {isDealPinned(dealOfWeek) ? 'Losmaken' : 'Vastzetten'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                    Geen deal van de week beschikbaar. Controleer de productfeed en probeer opnieuw.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="flex items-center gap-2">
                  <TargetIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-gray-900">Snelle zoekactie</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <SearchIcon
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            void handleSearch()
                          }
                        }}
                        placeholder="Zoek op productnaam, categorie of tag"
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleSearch()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
                    >
                      <SearchIcon className="h-4 w-4" aria-hidden="true" />
                      Zoek
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="mr-2 uppercase tracking-wide">Prijsfilters:</span>
                    {(
                      Object.keys(priceFilterLabels) as Array<'all' | 'budget' | 'mid' | 'premium'>
                    ).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => void handlePriceShortcut(option)}
                        className={`rounded-full px-3 py-1 transition ${
                          priceFilter === option
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {priceFilterLabels[option]}
                      </button>
                    ))}
                  </div>
                  {isSearching ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Resultaten laden…
                    </div>
                  ) : uniqueSearchResults.length ? (
                    <div className="space-y-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {priceFilter === 'all' && !searchTerm
                          ? 'Huidige topdeals'
                          : `Resultaten (${uniqueSearchResults.length})`}
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {uniqueSearchResults.slice(0, 6).map((deal) => (
                          <div
                            key={deal.id}
                            className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                          >
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                              <ImageWithFallback
                                src={deal.imageUrl}
                                alt={deal.name}
                                className="h-full w-full"
                                fit="contain"
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-gray-700">
                              <p className="font-semibold text-gray-900 line-clamp-2">
                                {deal.name}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {deal.description}
                              </p>
                              <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">
                                  {deal.price}
                                </span>
                                {deal.giftScore && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                                    Score {deal.giftScore}
                                  </span>
                                )}
                                {isDealPinned(deal) && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                                    <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                                    Vastgezet
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => togglePinDeal(deal)}
                                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                                    isDealPinned(deal)
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {isDealPinned(deal) ? (
                                    <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                                  ) : (
                                    <BookmarkIcon className="h-3 w-3" aria-hidden="true" />
                                  )}
                                  {isDealPinned(deal) ? 'Losmaken' : 'Vastzetten'}
                                </button>
                                <a
                                  href={withAffiliate(deal.affiliateLink)}
                                  target="_blank"
                                  rel="noopener noreferrer sponsored"
                                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                                >
                                  Bekijk
                                </a>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDeal(deal)}
                                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                >
                                  Kopieer snippet
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Voer een zoekterm in of kies een prijsfilter om suggesties te zien.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top 10 populaire deals</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Live feed selectie
              </span>
            </div>
            {loading && !uniqueTopDeals.length ? (
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                Topdeals laden…
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {uniqueTopDeals.map((deal, index) => (
                  <div
                    key={deal.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 font-semibold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 line-clamp-2">
                          {deal.name}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                            {deal.description}
                          </p>
                          {isDealPinned(deal) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                              <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                              Vastgezet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <ImageWithFallback
                          src={deal.imageUrl}
                          alt={deal.name}
                          className="h-full w-full"
                          fit="contain"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">
                            {deal.price}
                          </span>
                          {deal.originalPrice && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">
                              <s>{deal.originalPrice}</s>
                            </span>
                          )}
                          {deal.giftScore && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">
                              Score {deal.giftScore}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <button
                            type="button"
                            onClick={() => togglePinDeal(deal)}
                            className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 font-semibold transition ${
                              isDealPinned(deal)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {isDealPinned(deal) ? (
                              <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <BookmarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {isDealPinned(deal) ? 'Losmaken' : 'Vastzetten'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopyDeal(deal)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1 font-semibold text-gray-600 transition hover:bg-gray-100"
                          >
                            <GiftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Kopieer
                          </button>
                          <a
                            href={withAffiliate(deal.affiliateLink)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Bekijk
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {categories.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Categorieblokken</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.title}
                    className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
                      <h4 className="text-base font-semibold text-gray-900">{category.title}</h4>
                    </div>
                    <div
                      className={`grid grid-cols-1 gap-3 ${
                        category.items.length >= 4
                          ? 'md:grid-cols-2 xl:grid-cols-4'
                          : 'md:grid-cols-2'
                      }`}
                    >
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex h-full flex-col rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/70 p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full"
                                fit="contain"
                              />
                            </div>
                            <div className="flex-1 space-y-1 text-sm">
                              <p className="font-semibold text-gray-900 line-clamp-2">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-3">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">
                              {item.price}
                            </span>
                            {item.giftScore && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                                Score {item.giftScore}
                              </span>
                            )}
                            {isDealPinned(item) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                                <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                                Vastgezet
                              </span>
                            )}
                          </div>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => togglePinDeal(item)}
                                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 transition ${
                                  isDealPinned(item)
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {isDealPinned(item) ? (
                                  <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <BookmarkIcon className="h-3 w-3" aria-hidden="true" />
                                )}
                                {isDealPinned(item) ? 'Losmaken' : 'Vastzetten'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleCopyDeal(item)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                              >
                                Kopieer snippet
                              </button>
                            </div>
                            <a
                              href={withAffiliate(item.affiliateLink)}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-600 transition hover:bg-rose-100"
                            >
                              <LinkIcon className="h-3 w-3" aria-hidden="true" />
                              Bekijk
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface SettingsAdminProps {
  adminEmails: string[]
  firebaseEnabled: boolean
  preferences: AdminPreferences
  onUpdatePreferences: (patch: Partial<AdminPreferences>) => void
  onSelectTab: (tab: AdminTab) => void
  navigateTo: NavigateTo
}

const tabLabels: Record<AdminTab, string> = {
  overview: 'Overzicht',
  blog: 'Blogbeheer',
  deals: 'Deals',
  newsletter: 'Nieuwsbrief',
  messages: 'Berichten',
  import: 'Bulk Import',
  images: 'Image Validator',
  settings: 'Instellingen',
  activity: 'Activiteiten',
  performance: 'Performance',
}

const SettingsAdmin: React.FC<SettingsAdminProps> = ({
  adminEmails,
  firebaseEnabled,
  preferences,
  onUpdatePreferences,
  onSelectTab,
  navigateTo,
}) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!status || typeof window === 'undefined') {
      return
    }
    const timer = window.setTimeout(() => setStatus(null), 4000)
    return () => window.clearTimeout(timer)
  }, [status])

  const environmentMode = import.meta.env?.MODE ?? 'production'
  const isProduction = environmentMode === 'production'
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const localeTimestamp = useMemo(
    () => new Date().toLocaleString('nl-NL', { dateStyle: 'full', timeStyle: 'medium' }),
    []
  )
  const isClient = typeof navigator !== 'undefined'
  const isOnline = isClient ? navigator.onLine : true
  const userAgent = isClient ? navigator.userAgent : 'Onbekend'
  const adminEmailList = useMemo(() => adminEmails.join(', '), [adminEmails])

  const handleDefaultTabChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedTab = event.target.value as AdminTab
      onUpdatePreferences({ defaultTab: selectedTab })
      setStatus({
        type: 'success',
        message: `Standaardtab ingesteld op ${tabLabels[selectedTab]}.`,
      })
    },
    [onUpdatePreferences]
  )

  const handleResetPreferences = useCallback(() => {
    onUpdatePreferences({ defaultTab: defaultAdminPreferences.defaultTab })
    setStatus({ type: 'success', message: 'Voorkeuren teruggezet naar standaard (Blog).' })
  }, [onUpdatePreferences])

  const handleCopyAdminEmails = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(adminEmailList)
        setStatus({ type: 'success', message: 'Admin e-mailadressen gekopieerd naar klembord.' })
      } else {
        throw new Error('Clipboard API niet beschikbaar')
      }
    } catch (error: unknown) {
      logUnknownError('Kopiëren mislukt', error, {
        scope: 'admin.settings.copyAdminEmails',
      })
      setStatus({ type: 'error', message: 'Kopiëren mislukt. Controleer browser permissies.' })
    }
  }, [adminEmailList])

  const handleOpenDocs = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const quickLinks = useMemo(
    () => [
      {
        label: 'Deals overzicht',
        description: 'Werk pins bij en controleer affiliate links.',
        action: () => onSelectTab('deals'),
      },
      {
        label: 'Blogbeheer',
        description: 'Open editor, analytics en productwizard.',
        action: () => onSelectTab('blog'),
      },
    ],
    [onSelectTab]
  )

  const resourceLinks = useMemo(
    () => [
      {
        label: 'Deployment handleiding',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/DEPLOYMENT.md',
      },
      {
        label: 'Performance checklist',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/PERFORMANCE.md',
      },
      {
        label: 'Beveiligingsoverzicht',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/SECURITY.md',
      },
      {
        label: 'Firebase console',
        href: 'https://console.firebase.google.com/project/gifteez-7533b/overview',
      },
    ],
    []
  )

  const adminCount = adminEmails.length

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin instellingen</h2>
            <p className="text-sm text-gray-500">
              Beheer persoonlijke voorkeuren en bewaak de platformstatus voor het Gifteez team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Bekijk site
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Omgeving
            </span>
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {isProduction ? 'Productie' : 'Test'}
            </p>
            <p className="text-xs text-gray-500">Mode: {environmentMode}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Firebase
              </span>
              {firebaseEnabled ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {firebaseEnabled ? 'Verbonden' : 'Niet actief'}
            </p>
            <p className="text-xs text-gray-500">Realtime data via Firestore</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Verbinding
              </span>
              {isOnline ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {isOnline ? 'Online' : 'Offline'}
            </p>
            <p className="text-xs text-gray-500">Browser: {isClient ? 'Actief' : 'Onbekend'}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Datum & tijd
            </span>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{timezone}</p>
            <p className="text-xs text-gray-500">{localeTimestamp}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Persoonlijke voorkeuren</h3>
          <p className="text-sm text-gray-500">
            Kies met welk tabblad het admin dashboard standaard opent op jouw device.
          </p>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Standaard tabblad
            <select
              value={preferences.defaultTab}
              onChange={handleDefaultTabChange}
              className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-200"
            >
              {Object.entries(tabLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleResetPreferences}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Reset naar standaard
            </button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Context</p>
            <ul className="mt-2 space-y-1">
              <li>Gekozen standaardtab: {tabLabels[preferences.defaultTab]}</li>
              <li>
                Browser: <span className="break-all text-gray-600">{userAgent}</span>
              </li>
              <li>Laadmoment: {localeTimestamp}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Admin team</h3>
          <p className="text-sm text-gray-500">
            {adminCount} geautoriseerde accounts hebben toegang tot dit dashboard.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {adminEmails.map((email) => (
              <span
                key={email}
                className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600"
              >
                {email}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyAdminEmails}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Kopieer e-mails
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenDocs('mailto:beheer@gifteez.nl?subject=Admin%20toegang%20aanvragen')
              }
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Stuur uitnodiging
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Tip: verhuis op termijn deze lijst naar Firestore voor dynamisch beheer en audit
            logging.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Snelkoppelingen</h3>
          <p className="text-sm text-gray-500">Spring direct naar veelgebruikte dashboards.</p>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={link.action}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-left text-sm text-gray-700 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                  <span>{link.label}</span>
                  <SparklesIcon className="h-4 w-4 text-rose-500" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs text-gray-500">{link.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Documentatie & hulpmiddelen</h3>
          <p className="text-sm text-gray-500">
            Handige resources voor uitrol, performance en beveiliging.
          </p>
          <ul className="space-y-3 text-sm text-gray-600">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => handleOpenDocs(link.href)}
                  className="inline-flex items-center gap-2 font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  <LinkIcon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
