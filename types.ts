/* eslint-disable no-unused-vars */
import type React from 'react'
export type Page =
  | 'home'
  | 'giftFinder'
  | 'categories'
  | 'blog'
  | 'favorites'
  | 'blogDetail'
  | 'contact'
  | 'about'
  | 'login'
  | 'signup'
  | 'account'
  | 'quiz'
  | 'download'
  | /* 'shop' | */ 'cart'
  | 'checkoutSuccess'
  | 'deals'
  | 'categoryDetail'
  | 'productLanding'
  | 'comparison'
  | 'disclaimer'
  | 'privacy'
  | 'affiliateDisclosure'
  | 'admin'
  | 'adminDealsPreview'
  | 'programmatic'
  | 'cadeausHub'
  | 'notFound'
  | 'error'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NavigateTo = (_page: Page, _data?: any) => void

export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'error'

export type ShowToast = (_message: string, _variant?: ToastVariant) => void

export interface InitialGiftFinderData {
  recipient?: string
  occasion?: string
  interests?: string
}

export interface AdvancedFilters {
  priceRange: {
    min: number
    max: number
  }
  categories: string[]
  deliverySpeed: 'standard' | 'fast' | 'instant'
  giftType: 'physical' | 'experience' | 'digital' | 'subscription'
  popularity: 'trending' | 'classic' | 'unique'
  availability: 'in-stock' | 'pre-order' | 'all'
  sustainability: boolean
  personalization: boolean
  ageGroup: string
  gender: 'male' | 'female' | 'unisex'
  preferredPartner?: 'all' | 'sustainable'
}

export interface GiftSearchParams {
  recipient: string
  budget: number
  occasion: string
  interests: string
  gender?: string
  filters?: Partial<AdvancedFilters>
}

export interface Retailer {
  name: string
  affiliateLink: string
}

export interface RetailerBadge {
  label: string
  tone: 'primary' | 'accent' | 'success' | 'warning' | 'neutral'
  description?: string
}

export interface Gift {
  productName: string
  description: string
  priceRange: string
  retailers: Retailer[]
  imageUrl: string
  // Enhanced metadata for filtering
  category?: string
  tags?: string[]
  rating?: number
  reviews?: number
  deliverySpeed?: 'standard' | 'fast' | 'instant'
  giftType?: 'physical' | 'experience' | 'digital' | 'subscription'
  sustainability?: boolean
  personalization?: boolean
  ageGroup?: string
  gender?: 'male' | 'female' | 'unisex'
  popularity?: number
  availability?: 'in-stock' | 'pre-order' | 'out-of-stock'
  matchReason?: string // Why this gift matches the search criteria
  trendingBadge?: 'trending' | 'hot-deal' | 'seasonal' | 'top-rated' | null // Badge type
  relevanceScore?: number
  story?: string
  retailerBadges?: RetailerBadge[]
  // AI Enhancement fields
  explanations?: string[] // Human-readable reasons from AI scoring
  budgetFit?: number // 0-1 score for budget match
  occasionFit?: number // 0-1 score for occasion match
  personaFit?: number // 0-1 score for personality match
  trendScore?: number // 0-1 score for popularity/quality
}

export interface Testimonial {
  quote: string
  author: string
}

export interface Author {
  name: string
  avatarUrl: string
}

export interface BlogSeoMetadata {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  pinterestImage?: string // Pinterest-specific image (usually with text overlay)
  canonicalUrl?: string
}

// New specialized content block interfaces
export interface ComparisonTableRow {
  feature: string
  values: string[]
}
export interface ComparisonTableBlock {
  type: 'comparisonTable'
  headers: string[]
  rows: ComparisonTableRow[]
}

export interface ProsConsBlock {
  type: 'prosCons'
  // Each item in the array represents a product column
  items: {
    title: string
    pros: string[]
    cons: string[]
  }[]
}

export interface VerdictBlock {
  type: 'verdict'
  title: string
  content: string
}

export interface FAQItem {
  question: string
  answer: string
}
export interface FAQBlock {
  type: 'faq'
  items: FAQItem[]
}

export interface ImageBlock {
  type: 'image'
  src: string
  alt?: string
  caption?: string
  href?: string
}

export type ContentBlock =
  | { type: 'heading'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'gift'; content: Gift }
  | ImageBlock
  | ComparisonTableBlock
  | ProsConsBlock
  | VerdictBlock
  | FAQBlock

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  category: string
  author: Author
  publishedDate: string
  content: ContentBlock[] | string
  seo?: BlogSeoMetadata
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  published?: boolean
  isDraft?: boolean
}

export interface Category {
  name: string
  icon: React.ComponentType<{ className?: string }>
}

export interface GiftProfile {
  id: string
  name: string
  relationship: string
  interests: string
}

export interface User {
  id: string
  name: string
  email: string
  password?: string // Should not be stored long term, but needed for simulation
  favorites: Gift[]
  profiles: GiftProfile[]
  // Enhanced account features
  avatar?: string
  preferences: UserPreferences
  createdAt: string
  lastActive: string
  favoritesSyncedAt?: string
  notifications: NotificationSettings
}

export interface UserPreferences {
  currency: 'EUR' | 'USD' | 'GBP'
  language: 'nl' | 'en' | 'de' | 'fr'
  theme: 'light' | 'dark' | 'auto'
  emailNotifications: boolean
  pushNotifications: boolean
  favoriteCategories: string[]
  priceRange: {
    min: number
    max: number
  }
}

export interface NotificationSettings {
  newBlogPosts: boolean
  giftRecommendations: boolean
  priceDrops: boolean
  weeklyDigest: boolean
}

export interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login: (_email: string, _password: string) => Promise<User | null>
  signup: (_name: string, _email: string, _password: string) => Promise<User | null>
  logout: () => void
  resetPassword: (_email: string) => Promise<boolean>
  toggleFavorite: (_gift: Gift) => void
  isFavorite: (_gift: Gift) => boolean
  addProfile: (_profileData: Omit<GiftProfile, 'id'>) => Promise<void>
  updateProfile: (_profile: GiftProfile) => Promise<void>
  deleteProfile: (_profileId: string) => Promise<void>
  // Enhanced user management
  updateUserPreferences: (_preferences: Partial<UserPreferences>) => Promise<void>
  updateNotificationSettings: (_settings: Partial<NotificationSettings>) => Promise<void>
  syncFavorites: () => Promise<void>
  updateAvatar: (_avatar: string) => Promise<void>
  getFavoritesByCategory: () => Record<string, Gift[]>
  exportFavorites: () => Promise<string> // JSON export
  importFavorites: (_data: string) => Promise<void>
}

export type QuizQuestionKind = 'persona' | 'budget' | 'relationship' | 'occasion'

export type BudgetTier = 'budget-low' | 'budget-mid' | 'budget-high'
export type RelationshipType = 'partner' | 'friend' | 'colleague' | 'family'
export type OccasionType = 'birthday' | 'housewarming' | 'holidays' | 'anniversary'

export interface QuizAnswer {
  text: string
  value: string
  resultKey?: string
  helperText?: string
}

export interface QuizQuestion {
  id: number
  text: string
  answers: QuizAnswer[]
  kind: QuizQuestionKind
  metaKey?: 'budget' | 'relationship' | 'occasion'
}

export interface ShoppingListItem {
  title: string
  description: string
  url: string
}

export type PersonaShoppingList = Partial<Record<BudgetTier, ShoppingListItem[]>>

export type PersonaOccasionCopy = Partial<Record<OccasionType, string>>

export interface QuizResult {
  title: string
  description: string
  recommendedInterests: string
  relatedBlogSlugs: string[]
  shoppingList?: PersonaShoppingList
  occasionHighlights?: PersonaOccasionCopy
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  downloadUrl: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface CartContextType {
  cart: CartItem[]
  addToCart: (_product: Product) => void
  removeFromCart: (_productId: string) => void
  clearCart: () => void
  itemCount: number
}

export interface DealItem {
  id: string
  name: string
  description: string
  imageUrl: string
  price: string
  affiliateLink: string
  originalPrice?: string
  isOnSale?: boolean
  tags?: string[]
  giftScore?: number
  image?: string
  category?: string
  brand?: string
  merchant?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
  deliveryInfo?: string
}

export interface DealCategory {
  id?: string
  title: string
  description?: string
  items: DealItem[]
}

// Newsletter & Email Types
export interface NewsletterSubscriber {
  email: string
  name?: string
  subscribedAt: Date
  status: 'active' | 'unsubscribed'
  source: 'footer' | 'giftfinder' | 'popup' | 'admin'
  preferences?: {
    deals?: boolean
    blog?: boolean
    tips?: boolean
  }
  unsubscribedAt?: Date
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[] // e.g., ["{{name}}", "{{unsubscribe_link}}"]
  createdAt: Date
  updatedAt: Date
  category: 'welcome' | 'newsletter' | 'transactional' | 'promotional'
}

export interface EmailCampaign {
  id: string
  name: string
  templateId: string
  subject: string
  scheduledFor?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  recipientCount: number
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
  }
  createdBy: string
  createdAt: Date
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  createdAt: Date
  read: boolean
  replied: boolean
  repliedAt?: Date
  notes?: string
}
