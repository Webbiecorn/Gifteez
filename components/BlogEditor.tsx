import React, { useEffect, useMemo, useState } from 'react'
import { blogPosts } from '../data/blogData'
import { AmazonProductLibrary } from '../services/amazonProductLibrary'
import BlogService from '../services/blogService'
import {
  contentBlocksToDrafts,
  draftsToContentBlocks,
  draftsToHtml,
  draftsToPlainText,
  stringToDrafts,
  normalizeDraftList,
} from '../services/contentDraftMapper'
import CoolblueFeedService from '../services/coolblueFeedService'
import { BlogPreview } from './BlogPreview'
import ContentBuilder, { generateId } from './ContentBuilder'
import ImageUpload from './ImageUpload'
import SEOPanel from './SEOPanel'
import type {
  ContentBlockDraft,
  GiftBlockDraft,
  ParagraphBlockDraft,
  RetailerDraft,
} from './ContentBuilder'
import type { BlogPostData } from '../services/blogService'
import type { SEOData } from '../services/seoManager'
import type { BlogSeoMetadata } from '../types'
import type { Timestamp } from 'firebase/firestore'

type ProductSource = 'coolblue' | 'amazon'

type EditorProduct = {
  id: string
  name: string
  description?: string | null
  shortDescription?: string | null
  imageUrl?: string | null
  price?: number | null
  originalPrice?: number | null
  affiliateLink?: string | null
  tags?: string[] | null
  source: ProductSource
}

type BlogEditorProps = {
  onClose: () => void
  postId?: string | null
  postSlug?: string | null
  initialPost?: BlogPostData | null
}

const toSeoData = (metadata?: BlogSeoMetadata | null): SEOData | null => {
  if (!metadata) {
    return null
  }

  return {
    metaTitle: metadata.metaTitle ?? '',
    metaDescription: metadata.metaDescription ?? '',
    keywords: metadata.keywords ?? [],
    ogTitle: metadata.ogTitle,
    ogDescription: metadata.ogDescription,
    ogImage: metadata.ogImage,
    ogType: metadata.ogType,
    twitterCard: metadata.twitterCard,
    twitterTitle: metadata.twitterTitle,
    twitterDescription: metadata.twitterDescription,
    twitterImage: metadata.twitterImage,
    canonicalUrl: metadata.canonicalUrl,
  }
}

const hasToDate = (value: unknown): value is { toDate: () => Date } =>
  Boolean(value && typeof (value as { toDate?: unknown }).toDate === 'function')

const toIsoString = (value?: string | Timestamp | Date | null): string | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (hasToDate(value)) {
    try {
      return value.toDate().toISOString()
    } catch {
      return undefined
    }
  }

  return undefined
}

const DUTCH_STOPWORDS = new Set([
  'de',
  'het',
  'een',
  'en',
  'maar',
  'want',
  'toch',
  'ook',
  'bij',
  'op',
  'met',
  'van',
  'voor',
  'dat',
  'die',
  'dit',
  'daar',
  'hier',
  'heb',
  'hebt',
  'heeft',
  'hebben',
  'zijn',
  'ben',
  'bent',
  'is',
  'was',
  'waren',
  'word',
  'wordt',
  'worden',
  'kunnen',
  'kan',
  'kunt',
  'kon',
  'konnen',
  'we',
  'wij',
  'jullie',
  'je',
  'jij',
  'u',
  'ik',
  'ze',
  'zij',
  'hun',
  'hen',
  'als',
  'dan',
  'te',
  'tot',
  'niet',
  'geen',
  'wel',
  'al',
  'door',
  'over',
  'onder',
  'tussen',
  'waar',
  'wanneer',
  'hoe',
  'wat',
  'welke',
  'er',
  'hierdoor',
  'daarom',
  'daardoor',
  'eens',
  'toen',
  'na',
  'vooral',
  'veel',
  'meer',
  'minder',
  'zoals',
  'via',
  'onder',
  'boven',
  'tegen',
  'binnen',
  'buiten',
])

const normalizeForTagExtraction = (raw: string): string => {
  if (!raw) {
    return ''
  }
  return raw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const toDisplayTag = (value: string): string => {
  const normalized = value.trim()
  if (!normalized) {
    return ''
  }
  return normalized
    .toLowerCase()
    .split(/\s+|-/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const mergeTagLists = (primary: string[], secondary: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const list of [primary, secondary]) {
    for (const tag of list) {
      const cleaned = tag.trim()
      if (!cleaned) {
        continue
      }
      const key = cleaned.toLowerCase()
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      result.push(cleaned)
    }
  }

  return result
}

const countWords = (value?: string) => {
  if (!value) {
    return 0
  }
  return value.trim().split(/\s+/).filter(Boolean).length
}

const BlogEditor: React.FC<BlogEditorProps> = ({ onClose, postId, postSlug, initialPost }) => {
  const hasWindow = typeof window !== 'undefined'
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [contentDrafts, setContentDrafts] = useState<ContentBlockDraft[]>(() =>
    normalizeDraftList([])
  )
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isDraft, setIsDraft] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [coolblueProducts, setCoolblueProducts] = useState<EditorProduct[]>([])
  const [amazonProducts, setAmazonProducts] = useState<EditorProduct[]>([])
  const [productFilter, setProductFilter] = useState<'all' | ProductSource>('all')
  const [productSearch, setProductSearch] = useState('')
  const [productTagFilter, setProductTagFilter] = useState<string | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [slugValue, setSlugValue] = useState('')
  const [hasCustomSlug, setHasCustomSlug] = useState(false)
  const [tagsValue, setTagsValue] = useState('')

  const showAlert = (message: string) => {
    if (hasWindow) {
      window.alert(message)
      return
    }
    console.warn('Alert skipped (no window available):', message)
  }

  const plainTextContent = useMemo(() => draftsToPlainText(contentDrafts), [contentDrafts])
  const htmlContent = useMemo(() => draftsToHtml(contentDrafts), [contentDrafts])
  const structuredBlocks = useMemo(() => draftsToContentBlocks(contentDrafts), [contentDrafts])
  const parsedTags = useMemo(
    () =>
      tagsValue
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsValue]
  )

  const suggestedExcerpt = useMemo(() => {
    const source = plainTextContent || title
    if (!source?.trim()) {
      return ''
    }
    const normalized = source.replace(/\s+/g, ' ').trim()
    if (!normalized) {
      return ''
    }
    const words = normalized.split(' ')
    const excerptCandidate = words.slice(0, 45).join(' ')
    const trimmed =
      excerptCandidate.length > 220
        ? `${excerptCandidate.slice(0, 217).trimEnd()}…`
        : excerptCandidate
    return trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')
      ? trimmed
      : `${trimmed}…`
  }, [plainTextContent, title])

  const suggestedTags = useMemo(() => {
    const textPool = normalizeForTagExtraction(
      `${category ?? ''} ${title ?? ''} ${plainTextContent ?? ''}`
    )
    if (!textPool) {
      return category ? [toDisplayTag(category)] : []
    }

    const counts = new Map<string, number>()
    textPool.split(' ').forEach((word) => {
      if (!word || word.length < 4 || DUTCH_STOPWORDS.has(word)) {
        return
      }
      counts.set(word, (counts.get(word) ?? 0) + 1)
    })

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => toDisplayTag(word))

    const base = category ? [toDisplayTag(category)] : []
    return mergeTagLists(base, sorted).slice(0, 6)
  }, [plainTextContent, category, title])

  const excerptCharCount = useMemo(() => excerpt.trim().length, [excerpt])

  const wordCount = useMemo(() => countWords(plainTextContent), [plainTextContent])
  const readMinutes = useMemo(
    () => (wordCount ? Math.max(1, Math.round(wordCount / 220)) : 0),
    [wordCount]
  )
  const seoTitle = useMemo(() => (seoData?.metaTitle ?? title).trim(), [seoData, title])
  const seoDescription = useMemo(
    () => (seoData?.metaDescription ?? excerpt).trim(),
    [seoData, excerpt]
  )
  const seoTitleLength = seoTitle.length
  const seoDescriptionLength = seoDescription.length
  const keywordsCount = useMemo(() => {
    if (!seoData?.keywords) {
      return 0
    }
    return seoData.keywords.filter((keyword) => keyword.trim().length > 0).length
  }, [seoData])
  const hasHero = Boolean(imageUrl)
  const marketingChecklist = useMemo(
    () => [
      { id: 'hero', label: 'Hero-afbeelding toegevoegd', ok: hasHero },
      { id: 'words', label: 'Minimaal 400 woorden', ok: wordCount >= 400 },
      {
        id: 'seoTitle',
        label: 'SEO titel 35-60 tekens',
        ok: seoTitleLength >= 35 && seoTitleLength <= 60,
      },
      {
        id: 'metaDescription',
        label: 'Meta description 80-160 tekens',
        ok: seoDescriptionLength >= 80 && seoDescriptionLength <= 160,
      },
    ],
    [hasHero, wordCount, seoTitleLength, seoDescriptionLength]
  )
  const checklistScore = useMemo(() => {
    if (!marketingChecklist.length) {
      return 0
    }
    const completed = marketingChecklist.filter((item) => item.ok).length
    return Math.round((completed / marketingChecklist.length) * 100)
  }, [marketingChecklist])

  const combinedProducts = useMemo(
    () => [...coolblueProducts, ...amazonProducts],
    [coolblueProducts, amazonProducts]
  )

  const filteredProducts = useMemo(() => {
    if (!combinedProducts.length) {
      return []
    }
    const term = productSearch.trim().toLowerCase()
    let pool = combinedProducts
    if (productFilter !== 'all') {
      pool = pool.filter((product) => product.source === productFilter)
    }
    if (productTagFilter) {
      const target = productTagFilter.toLowerCase()
      pool = pool.filter((product) =>
        (product.tags ?? []).some((tag) => tag.toLowerCase() === target)
      )
    }
    if (term) {
      pool = pool.filter((product) => {
        const haystack =
          `${product.name} ${product.description ?? ''} ${(product.tags ?? []).join(' ')}`.toLowerCase()
        return haystack.includes(term)
      })
    }
    return pool.slice(0, 12)
  }, [combinedProducts, productFilter, productSearch, productTagFilter])

  const availableProductTags = useMemo(() => {
    const counts = new Map<string, number>()
    combinedProducts.forEach((product) => {
      ;(product.tags ?? []).forEach((tag) => {
        const key = tag.trim().toLowerCase()
        if (!key) {
          return
        }
        counts.set(key, (counts.get(key) ?? 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, label: toDisplayTag(key), count }))
  }, [combinedProducts])

  const generatedSlug = useMemo(() => BlogService.generateSlug(title || ''), [title])
  const slugPreview = useMemo(() => slugValue.trim() || generatedSlug, [slugValue, generatedSlug])
  const categoryOptions = useMemo(() => {
    const base = new Set<string>([
      'Home & Office',
      'Tech',
      'Duurzaam',
      'Lifestyle',
      'Reviews',
      'Tips',
      'Deals',
    ])
    blogPosts.forEach((postEntry) => {
      if (postEntry.category?.trim()) {
        base.add(postEntry.category.trim())
      }
    })
    if (category?.trim()) {
      base.add(category.trim())
    }
    return Array.from(base)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'nl-NL'))
  }, [category])

  const applyPostData = (existingPost: BlogPostData) => {
    setPost(existingPost)
    setTitle(existingPost.title || '')
    setExcerpt(existingPost.excerpt || '')
    setCategory(existingPost.category || '')
    const drafts = normalizeDraftList(
      existingPost.contentBlocks && existingPost.contentBlocks.length
        ? contentBlocksToDrafts(existingPost.contentBlocks)
        : stringToDrafts(existingPost.content || '')
    )
    setContentDrafts(drafts)
    setImageUrl(existingPost.imageUrl || '')
    setIsDraft(existingPost.isDraft ?? true)
    setSeoData(toSeoData(existingPost.seo))
    setSlugValue(existingPost.slug || '')
    setHasCustomSlug(Boolean(existingPost.slug))
    setTagsValue(existingPost.tags?.join(', ') || existingPost.seo?.keywords?.join(', ') || '')
  }

  useEffect(() => {
    const loadPost = async () => {
      if (initialPost) {
        applyPostData(initialPost)
        setIsLoading(false)
        return
      }

      if (postId) {
        setIsLoading(true)
        try {
          const existingPost = await BlogService.getPostById(postId)
          if (existingPost) {
            applyPostData(existingPost)
          }
        } catch (error) {
          console.error('Error loading post:', error)
        } finally {
          setIsLoading(false)
        }
      } else if (postSlug) {
        // Fallback voor bestaande posts uit static data
        const existingPost = blogPosts.find((p) => p.slug === postSlug)
        if (existingPost) {
          setTitle(existingPost.title)
          setExcerpt(existingPost.excerpt)
          setCategory(existingPost.category)
          setImageUrl(existingPost.imageUrl || '')
          setSlugValue(existingPost.slug || '')
          setHasCustomSlug(Boolean(existingPost.slug))

          // Convert content blocks to simple text for now
          const drafts = Array.isArray(existingPost.content)
            ? normalizeDraftList(contentBlocksToDrafts(existingPost.content))
            : normalizeDraftList(stringToDrafts(existingPost.content || ''))
          setContentDrafts(drafts)
          setSeoData(toSeoData(existingPost.seo))
          setTagsValue(
            existingPost.tags?.join(', ') || existingPost.seo?.keywords?.join(', ') || ''
          )
        }
      }
    }

    loadPost()
  }, [postId, postSlug, initialPost])

  useEffect(() => {
    if (!hasCustomSlug) {
      setSlugValue(generatedSlug)
    }
  }, [generatedSlug, hasCustomSlug])

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const [coolblueFeed, amazonFeed] = await Promise.all([
          CoolblueFeedService.loadProducts(),
          AmazonProductLibrary.loadProducts(),
        ])

        if (cancelled) return

        const coolblueGallery: EditorProduct[] = coolblueFeed
          .filter((product) => (product.imageUrl || product.image) && product.affiliateLink)
          .slice(0, 100)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? product.shortDescription,
            shortDescription: product.shortDescription,
            imageUrl: product.imageUrl || product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            affiliateLink: product.affiliateLink,
            tags: product.tags,
            source: 'coolblue',
          }))
        setCoolblueProducts(coolblueGallery)

        const amazonGallery: EditorProduct[] = amazonFeed
          .filter((product) => product.affiliateLink)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? product.shortDescription,
            shortDescription: product.shortDescription,
            imageUrl: product.imageLarge ?? product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            affiliateLink: product.affiliateLink,
            tags: product.tags,
            source: 'amazon',
          }))
        setAmazonProducts(amazonGallery)
      } catch (error) {
        console.warn('Kon productafbeeldingen niet laden voor blogeditor:', error)
        if (!cancelled) {
          setCoolblueProducts([])
          setAmazonProducts([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSlugInputChange = (value: string) => {
    const sanitized = BlogService.generateSlug(value || '')
    setSlugValue(sanitized)
    setHasCustomSlug(Boolean(sanitized))
  }

  const handleSlugReset = () => {
    setHasCustomSlug(false)
    setSlugValue(generatedSlug)
  }

  const hasSuggestedExcerpt = useMemo(
    () => Boolean(suggestedExcerpt && suggestedExcerpt.trim() !== excerpt.trim()),
    [suggestedExcerpt, excerpt]
  )

  const canApplySmartMetadata = useMemo(() => {
    const slugNeedsUpdate = slugValue !== generatedSlug
    const tagSet = new Set(parsedTags.map((tag) => tag.toLowerCase()))
    const hasMissingTag = suggestedTags.some((tag) => !tagSet.has(tag.toLowerCase()))
    return slugNeedsUpdate || hasMissingTag || hasSuggestedExcerpt
  }, [generatedSlug, slugValue, parsedTags, suggestedTags, hasSuggestedExcerpt])

  const handleApplySuggestedExcerpt = () => {
    if (suggestedExcerpt) {
      setExcerpt(suggestedExcerpt)
    }
  }

  const handleApplySuggestedTags = () => {
    if (!suggestedTags.length) {
      return
    }
    const merged = mergeTagLists(parsedTags, suggestedTags)
    setTagsValue(merged.join(', '))
  }

  const handleTagSuggestionClick = (tag: string) => {
    const merged = mergeTagLists(parsedTags, [tag])
    setTagsValue(merged.join(', '))
  }

  const handleApplySmartMetadata = () => {
    if (generatedSlug) {
      setHasCustomSlug(false)
      setSlugValue(generatedSlug)
    }
    if (suggestedTags.length) {
      handleApplySuggestedTags()
    }
    if (hasSuggestedExcerpt) {
      handleApplySuggestedExcerpt()
    }
  }

  const addDraftBlocks = (incoming: ContentBlockDraft | ContentBlockDraft[]) => {
    const additions = Array.isArray(incoming) ? incoming : [incoming]
    setContentDrafts((prev) => {
      const hasOnlyEmptyPlaceholder =
        prev.length === 1 &&
        prev[0].type === 'paragraph' &&
        !(prev[0] as ParagraphBlockDraft).text.trim()
      const base = hasOnlyEmptyPlaceholder ? [] : prev
      return [...base, ...additions]
    })
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const handleInsertProduct = (product: EditorProduct, variant: 'image+link' | 'link-only') => {
    const retailerLabel = product.source === 'amazon' ? 'Amazon.nl' : 'Coolblue'
    const baseRetailer: RetailerDraft = {
      id: generateId(),
      name: retailerLabel,
      affiliateLink: product.affiliateLink || '',
    }

    if (variant === 'image+link') {
      const giftDraft: GiftBlockDraft = {
        id: generateId(),
        type: 'gift',
        gift: {
          productName: product.name,
          description: product.shortDescription || product.description || '',
          priceRange: product.price
            ? `€${product.price.toFixed(2)}`
            : product.originalPrice
              ? `€${product.originalPrice.toFixed(2)}`
              : '',
          imageUrl: product.imageUrl || '',
          retailers: [baseRetailer],
          tags: (product.tags ?? []).join(', '),
        },
      }
      addDraftBlocks(giftDraft)
      return
    }

    if (!product.affiliateLink) {
      const paragraphDraft: ParagraphBlockDraft = {
        id: generateId(),
        type: 'paragraph',
        style: 'paragraph',
        text: product.shortDescription || product.description || product.name,
      }
      addDraftBlocks(paragraphDraft)
      return
    }

    const ctaHtml = `<p class="text-base font-semibold text-rose-600">👉 <a href="${product.affiliateLink}" target="_blank" rel="sponsored nofollow noopener noreferrer">Bekijk ${escapeHtml(product.name)} bij ${retailerLabel}</a></p>`
    const paragraphDraft: ParagraphBlockDraft = {
      id: generateId(),
      type: 'paragraph',
      style: 'html',
      text: ctaHtml,
    }
    addDraftBlocks(paragraphDraft)
  }

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      showAlert('Titel is verplicht')
      return
    }

    if (!structuredBlocks.length || !htmlContent.trim()) {
      showAlert('Voeg contentblokken toe voordat je opslaat.')
      return
    }

    setIsSaving(true)

    try {
      const finalSlug = slugPreview.trim()
      const sanitizedCategory = category.trim() || 'Algemeen'
      const seoKeywords = parsedTags.length ? parsedTags : [sanitizedCategory]
      const postData: Omit<BlogPostData, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: finalSlug,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: htmlContent,
        imageUrl: imageUrl || undefined,
        category: sanitizedCategory,
        tags: parsedTags.length ? parsedTags : undefined,
        author: {
          name: 'Admin',
          avatarUrl: 'https://i.pravatar.cc/150?u=admin',
        },
        publishedDate: publish
          ? new Date().toISOString()
          : post?.publishedDate || new Date().toISOString(),
        isDraft: publish ? false : isDraft,
        contentBlocks: structuredBlocks.length ? structuredBlocks : undefined,
        seo: seoData
          ? {
              metaTitle: seoData.metaTitle,
              metaDescription: seoData.metaDescription,
              keywords:
                seoData.keywords && seoData.keywords.length ? seoData.keywords : seoKeywords,
              ogTitle: seoData.ogTitle,
              ogDescription: seoData.ogDescription,
              ogImage: seoData.ogImage,
              canonicalUrl: seoData.canonicalUrl,
            }
          : {
              metaTitle: title.trim(),
              metaDescription: excerpt.trim(),
              keywords: seoKeywords,
            },
      }

      if (postId) {
        // Update bestaande post
        await BlogService.updatePost(postId, postData)
        showAlert(`Blog post ${publish ? 'gepubliceerd' : 'opgeslagen'}!`)
      } else {
        // Nieuwe post aanmaken
        const newPostId = await BlogService.createPost(postData)
        showAlert(`Nieuwe blog post ${publish ? 'gepubliceerd' : 'opgeslagen'}! ID: ${newPostId}`)
      }

      onClose()
    } catch (error: unknown) {
      console.error('Error saving post:', error)
      const message = error instanceof Error ? error.message : 'Onbekende fout'
      showAlert(`Fout bij opslaan: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (url: string, _filename: string) => {
    setImageUrl(url)
  }

  const handleImageDelete = () => {
    setImageUrl('')
  }

  const previewFallbackDate = new Date().toISOString()
  const previewCreatedAt = toIsoString(post?.createdAt) ?? previewFallbackDate
  const previewUpdatedAt = toIsoString(post?.updatedAt) ?? previewCreatedAt
  const previewPublishedDate = post?.publishedDate || previewFallbackDate
  const previewPublishedAt = toIsoString(post?.publishedDate) ?? previewCreatedAt
  const previewAuthor = {
    name: post?.author?.name ?? 'Gifteez',
    avatarUrl: post?.author?.avatarUrl ?? 'https://i.pravatar.cc/150?u=blog-preview',
  }
  const previewImageUrl = imageUrl || post?.imageUrl || ''
  const previewTags = parsedTags.length ? parsedTags : (post?.tags ?? [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Post laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {post ? 'Blog Post Bewerken' : 'Nieuwe Blog Post'}
            </h2>
            {post && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}
              >
                {isDraft ? 'Concept' : 'Gepubliceerd'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Editor Insights */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Content status
                </p>
                <p className="mt-2 text-2xl font-semibold text-rose-600">{wordCount} woorden</p>
                <p className="text-xs text-rose-500">
                  {wordCount ? `≈ ${readMinutes} min leestijd` : 'Begin met schrijven'}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                  SEO-signalen
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-emerald-600">{seoTitleLength}</span>
                  <span className="text-xs text-emerald-500">tekens titel</span>
                </div>
                <p className="text-xs text-emerald-500">
                  Meta description {seoDescriptionLength}/160 · keywords {keywordsCount}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                  <span>Marketing checklist</span>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-600">
                    {checklistScore}% klaar
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {marketingChecklist.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center gap-2 ${item.ok ? 'text-emerald-600' : 'text-gray-500'}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.ok ? '✓' : '•'}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Title & slug */}
            <div className="grid gap-4 lg:grid-cols-[3fr,2fr]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Geef je blog post een titel..."
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplySmartMetadata}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canApplySmartMetadata}
                    >
                      Slim aanvullen
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={slugValue}
                    onChange={(e) => handleSlugInputChange(e.target.value)}
                    className="w-full sm:flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Wordt automatisch gebaseerd op de titel, maar je kunt hem hier aanpassen"
                  />
                  <button
                    type="button"
                    onClick={handleSlugReset}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!hasCustomSlug && slugValue === generatedSlug}
                  >
                    Slug opnieuw genereren
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Definitieve URL:{' '}
                  <span className="font-mono text-gray-600">
                    https://gifteez.nl/blog/{slugPreview || 'nieuwe-post'}
                  </span>
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categorie</label>
              <input
                list="blog-category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Bijv. Home & Office, Duurzaam, Cadeau Tips"
              />
              <datalist id="blog-category-options">
                {categoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-gray-500">
                Kies een bestaande categorie of typ een nieuwe naam om toe te voegen.
              </p>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <button
                  type="button"
                  onClick={handleApplySuggestedTags}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!suggestedTags.length}
                >
                  Voeg suggesties toe
                </button>
              </div>
              <input
                type="text"
                value={tagsValue}
                onChange={(e) => setTagsValue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Bijv. productiviteit, bureau, papier"
              />
              <p className="mt-1 text-xs text-gray-500">
                Scheiding met komma’s. Tags helpen bij zoekfilters en tonen onderaan je artikel.
              </p>
              {suggestedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => {
                    const tagActive = parsedTags.some(
                      (current) => current.toLowerCase() === tag.toLowerCase()
                    )
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagSuggestionClick(tag)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          tagActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        disabled={tagActive}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium text-gray-700">Samenvatting</label>
                <button
                  type="button"
                  onClick={handleApplySuggestedExcerpt}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!hasSuggestedExcerpt}
                >
                  Gebruik voorstel
                </button>
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Korte samenvatting voor op de blog overzichtspagina..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Aanbevolen lengte: 140–180 tekens. Huidig: {excerptCharCount} tekens.
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoofdafbeelding
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Deze afbeelding verschijnt als hero bovenaan het artikel. Lever bij voorkeur een
                liggende afbeelding van minimaal 1600×900 px aan.
              </p>
              <ImageUpload
                currentImage={imageUrl}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
                folder="blog-images"
                className="max-w-md"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <ContentBuilder
                value={contentDrafts}
                onChange={(drafts) => setContentDrafts(normalizeDraftList(drafts))}
              />
            </div>

            {/* Product media helper */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product visuals & affiliate links
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600">
                    {[
                      { key: 'all' as const, label: 'Alle bronnen' },
                      { key: 'coolblue' as const, label: 'Coolblue' },
                      { key: 'amazon' as const, label: 'Amazon.nl' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setProductFilter(option.key)}
                        className={`rounded-full px-3 py-1 transition-colors ${
                          productFilter === option.key
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Zoek in producten..."
                    className="w-56 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-4">
                <p className="text-xs text-gray-500">
                  Voeg eenvoudig productafbeeldingen toe aan je artikel. Klik op{' '}
                  <strong>Afbeelding + link</strong> om meteen een mooie afbeelding inclusief
                  affiliate link in de tekst te plakken, of kies <strong>Alleen link</strong> voor
                  een snelle call-to-action.
                </p>
                {availableProductTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Populaire tags:
                    </span>
                    {availableProductTags.map(({ key, label, count }) => {
                      const active = productTagFilter === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setProductTagFilter(active ? null : key)}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                            active
                              ? 'border-rose-200 bg-rose-500 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{label}</span>
                          <span className="text-[10px] opacity-70">{count}</span>
                        </button>
                      )
                    })}
                    {productTagFilter && (
                      <button
                        type="button"
                        onClick={() => setProductTagFilter(null)}
                        className="inline-flex items-center gap-1 rounded-full border border-transparent bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-200"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}
                {isLoadingProducts ? (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    Producten laden...
                  </div>
                ) : filteredProducts.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => {
                      const imageSrc = product.imageUrl || '/images/amazon-placeholder.png'
                      const priceLabel =
                        typeof product.price === 'number' &&
                        Number.isFinite(product.price) &&
                        product.price > 0
                          ? `€${product.price.toFixed(2)}`
                          : undefined
                      const retailerLabel = product.source === 'amazon' ? 'Amazon.nl' : 'Coolblue'
                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm"
                        >
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-100">
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              <span>{retailerLabel}</span>
                              {product.tags?.length ? (
                                <span className="truncate max-w-[45%]">
                                  {product.tags.slice(0, 2).join(' • ')}
                                </span>
                              ) : null}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                              {product.name}
                            </h4>
                            {priceLabel && (
                              <p className="text-xs text-gray-500 mb-3">{priceLabel}</p>
                            )}
                            {product.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                {product.description}
                              </p>
                            )}
                            <div className="mt-auto flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleInsertProduct(product, 'image+link')}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                                disabled={!product.affiliateLink}
                              >
                                Afbeelding + link
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertProduct(product, 'link-only')}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                                disabled={!product.affiliateLink}
                              >
                                Alleen link
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Geen producten gevonden. Probeer een andere zoekterm of controleer of de
                    productfeeds geladen zijn.
                  </p>
                )}
              </div>
            </div>

            {/* SEO Optimization */}
            {(title || structuredBlocks.length) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO & Social Media
                </label>
                <SEOPanel
                  title={title}
                  content={htmlContent}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                  slug={post?.slug}
                  onSEOChange={setSeoData}
                />
              </div>
            )}

            {/* Preview */}
            {structuredBlocks.length > 0 && htmlContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-600">Opslaan als concept</span>
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!title.trim() || !structuredBlocks.length}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Preview</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSaving ? 'Opslaan...' : 'Opslaan'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSaving ? 'Publiceren...' : 'Publiceren'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <BlogPreview
          post={{
            title,
            excerpt,
            content: htmlContent,
            category,
            imageUrl: previewImageUrl,
            slug: post?.slug || slugPreview,
            author: previewAuthor,
            published: !isDraft,
            isDraft,
            publishedDate: previewPublishedDate,
            publishedAt: previewPublishedAt,
            createdAt: previewCreatedAt,
            updatedAt: previewUpdatedAt,
            tags: previewTags.length ? previewTags : undefined,
          }}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

export default BlogEditor
