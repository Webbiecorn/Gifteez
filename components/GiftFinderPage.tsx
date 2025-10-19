import type { ChangeEvent } from 'react'
import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { withAffiliate } from '../services/affiliate'
import { processGiftsForAffiliateOnly } from '../services/affiliateFilterService'
import CoolblueAffiliateService from '../services/coolblueAffiliateService'
import {
  findGiftsWithFilters,
  sortGifts,
  enhanceGiftsWithMetadata,
} from '../services/giftFilterService'
import { logFilterEvent } from '../services/giftFinderAnalyticsService'
import { calculateGiftScore, extractPriceFromRange } from '../services/giftScoringService'
import { gaSearch, gaPageView } from '../services/googleAnalytics'
import { pinterestPageVisit, pinterestSearch } from '../services/pinterestTracking'
import { Gift, InitialGiftFinderData, ShowToast, GiftProfile, GiftSearchParams, RetailerBadge } from '../types';
import GiftFinderHero from './GiftFinderHero';
import Button from './Button'
import GiftResultCard from './GiftResultCard'
import { ThumbsUpIcon, ThumbsDownIcon, EmptyBoxIcon, SpinnerIcon, UserIcon } from './IconComponents'
import InternalLinkCTA from './InternalLinkCTA'
import Breadcrumbs from './Breadcrumbs'
import Meta from './Meta'
import rateLimitService from '../services/rateLimitService'
import { submitRelevanceFeedback } from '../services/scoringFeedbackService'
// AI Enhancement imports
import {
  generateSemanticLabels,
  generateUserPreferenceProfile,
  SemanticProfile,
} from '../services/semanticLabelService'

const occasions = ['Verjaardag', 'Kerstmis', 'Valentijnsdag', 'Jubileum', 'Zomaar']
const genders = ['Man', 'Vrouw', 'Anders']
const recipients = ['Partner', 'Vriend(in)', 'Familielid', 'Collega', 'Kind', 'Iemand bijzonder']

// Interests with gender relevance
const baseSuggestedInterests = [
  { name: 'Koken', icon: '🍳', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Tech', icon: '💻', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Boeken', icon: '📚', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Reizen', icon: '✈️', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Sport', icon: '⚽', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Duurzaamheid', icon: '🌱', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Wellness', icon: '🧘', genders: ['Vrouw', 'Anders'] },
  { name: 'Gaming', icon: '🎮', genders: ['Man', 'Anders'] },
  { name: 'Mode', icon: '👗', genders: ['Vrouw', 'Anders'] },
  { name: 'Muziek', icon: '🎵', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Grooming', icon: '🪒', genders: ['Man', 'Anders'] },
  { name: 'BBQ', icon: '🔥', genders: ['Man', 'Anders'] },
  { name: 'Gadgets', icon: '🛠️', genders: ['Man', 'Anders'] },
  { name: 'Sieraden', icon: '💍', genders: ['Vrouw', 'Anders'] },
  { name: 'Selfcare', icon: '💆', genders: ['Vrouw', 'Anders'] },
  { name: 'Creatief', icon: '🎨', genders: ['Vrouw', 'Anders'] },
  { name: 'Auto', icon: '🚗', genders: ['Man', 'Anders'] },
  { name: 'Beauty', icon: '💄', genders: ['Vrouw', 'Anders'] },
  { name: 'Fietsen', icon: '🚴', genders: ['Man', 'Vrouw', 'Anders'] },
  { name: 'Fotografie', icon: '📷', genders: ['Man', 'Vrouw', 'Anders'] },
]

const getRecipientNarrative = (recipient: string) => {
  const lower = recipient.toLowerCase()
  switch (lower) {
    case 'partner':
      return { noun: 'partner', objectPronoun: 'hen' }
    case 'vriend(in)':
      return { noun: 'vriend(in)', objectPronoun: 'hen' }
    case 'familielid':
      return { noun: 'familielid', objectPronoun: 'hen' }
    case 'collega':
      return { noun: 'collega', objectPronoun: 'hen' }
    case 'iemand bijzonder':
      return { noun: 'iemand bijzonder', objectPronoun: 'hen' }
    case 'kind':
      return { noun: 'kind', objectPronoun: 'ze' }
    default:
      return { noun: lower, objectPronoun: 'hen' }
  }
}

const buildRetailerBadges = (gift: Gift): RetailerBadge[] => {
  const badges: RetailerBadge[] = []
  const retailers = gift.retailers || []

  retailers.forEach((retailer) => {
    const name = retailer.name.toLowerCase()
    if (name.includes('amazon')) {
      badges.push({
        label: 'Amazon Prime',
        tone: 'primary',
        description: 'Supersnelle levering via Amazon',
      })
    } else if (name.includes('coolblue')) {
      badges.push({
        label: 'Coolblue VandaagBezorgd',
        tone: 'accent',
        description: 'Vandaag besteld, morgen in huis',
      })
    } else if (name.includes('shop like you give a damn') || name.includes('slygad')) {
      badges.push({
        label: 'SLYGAD Vegan',
        tone: 'success',
        description: '100% vegan & eerlijk geproduceerd',
      })
    }
  })

  if (gift.sustainability) {
    badges.push({
      label: 'Duurzame keuze',
      tone: 'success',
      description: 'Gemaakt met oog voor het milieu',
    })
  }

  return badges.filter(
    (badge, index, array) => array.findIndex((item) => item.label === badge.label) === index
  )
}

const createGiftStory = (
  gift: Gift,
  context: {
    recipient: string
    occasion: string
    matchingInterests: string[]
    badges: RetailerBadge[]
  }
): string => {
  const { recipient, occasion, matchingInterests, badges } = context
  const { noun } = getRecipientNarrative(recipient)

  const interestPhrase =
    matchingInterests.length > 0 ? `die ${matchingInterests[0].toLowerCase()} geweldig vindt` : ''

  const opening = `Voor je ${noun}${interestPhrase ? ` ${interestPhrase}` : ''} is ${gift.productName} een ${gift.sustainability ? 'bewuste' : 'verrassende'} match.`

  const badgeSentence =
    badges.length > 0
      ? `Met ${badges[0].label.toLowerCase()} heb je het ${gift.deliverySpeed === 'fast' ? 'supersnel' : 'zorgeloos'} in huis.`
      : gift.deliverySpeed === 'fast'
        ? 'Je hebt het morgen al in huis.'
        : ''

  const sustainabilitySentence = gift.sustainability
    ? 'Gemaakt met aandacht voor duurzaamheid.'
    : ''

  const occasionSentence = occasion ? `Perfect voor ${occasion.toLowerCase()}.` : ''

  return [opening, badgeSentence, sustainabilitySentence, occasionSentence]
    .filter(Boolean)
    .join(' ')
    .trim()
}

const GiftResultCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col animate-pulse">
    <div className="p-6 flex flex-col flex-grow">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="mt-4 space-y-2 flex-grow">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
)

interface GiftFinderPageProps {
  initialData?: InitialGiftFinderData
  showToast: ShowToast
}

const GiftFinderPage: React.FC<GiftFinderPageProps> = ({ initialData, showToast }) => {
  const [gender, setGender] = useState<string>(genders[0])
  const [recipient, setRecipient] = useState<string>(recipients[0])
  const [budget, setBudget] = useState<number>(50)
  const [occasion, setOccasion] = useState<string>(occasions[0])
  const [interests, setInterests] = useState<string>('')
  const [selectedInterestTags, setSelectedInterestTags] = useState<string[]>([]) // Track selected visual tags
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating' | 'popularity'>('relevance')
  const [gifts, setGifts] = useState<Gift[]>([])
  const [allGifts, setAllGifts] = useState<Gift[]>([])
  const [visibleCount, setVisibleCount] = useState<number>(6) // Show 6 initially
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false)
  const [personalizedIntro, setPersonalizedIntro] = useState<string>('')
  const [compareList, setCompareList] = useState<Gift[]>([])
  const [showCompareView, setShowCompareView] = useState<boolean>(false)
  const [noAffiliateResults, setNoAffiliateResults] = useState<boolean>(false)
  const [relevanceFeedback, setRelevanceFeedback] = useState<string>('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const auth = useContext(AuthContext)

  const suggestedInterests = useMemo(() => {
    // Filter interests based on selected gender
    return baseSuggestedInterests
      .filter((interest) => interest.genders.includes(gender))
      .filter(
        (interest, index, array) => array.findIndex((item) => item.name === interest.name) === index
      )
  }, [gender])

  const fallbackSearchQuery = useMemo(() => {
    const base = [recipient, occasion].filter(Boolean).join(' ')
    const interestPart = interests ? ` ${interests}` : ''
    const query = `${base} cadeau${interestPart}`.trim()
    return query || 'cadeau inspiratie'
  }, [recipient, occasion, interests])

  const amazonFallbackUrl = useMemo(() => {
    const url = `https://www.amazon.nl/s?k=${encodeURIComponent(fallbackSearchQuery)}`
    return withAffiliate(url)
  }, [fallbackSearchQuery])

  const coolblueFallbackUrl = useMemo(() => {
    return CoolblueAffiliateService.generateSearchUrl(fallbackSearchQuery, 'giftfinder-fallback')
  }, [fallbackSearchQuery])

  const handleLeadMagnetClick = useCallback(() => {
    gaSearch('giftfinder_lead_magnet_click')
    pinterestSearch('giftfinder_lead_magnet', `lead_magnet_${Date.now()}`)
  }, [])

  useEffect(() => {
    if (initialData?.recipient) setRecipient(initialData.recipient)
    if (initialData?.occasion) {
      const validOccasion = occasions.find(
        (o) => o.toLowerCase() === initialData.occasion?.toLowerCase()
      )
      if (validOccasion) setOccasion(validOccasion)
    }
    pinterestPageVisit('gift_finder', `finder_${Date.now()}`)
    gaPageView('/gift-finder', 'AI Gift Finder - Gifteez.nl')
  }, [initialData])

  const handleProfileSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value
    if (!profileId) return
    const selectedProfile = auth?.currentUser?.profiles.find((p) => p.id === profileId)
    if (selectedProfile) {
      const validRecipient = recipients.find(
        (r) => r.toLowerCase() === selectedProfile.relationship.toLowerCase()
      )
      setRecipient(validRecipient || recipients[0])
      setInterests(selectedProfile.interests)
      showToast(`Profiel '${selectedProfile.name}' geladen!`)
    }
  }

  const handleInterestClick = (interest: string) => {
    const currentInterests = interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)
    if (!currentInterests.includes(interest)) {
      setInterests((prev) => (prev ? `${prev}, ${interest}` : interest))
    }
  }

  const handleInterestTagToggle = (interestName: string) => {
    setSelectedInterestTags((prev) => {
      const isSelected = prev.includes(interestName)
      const newTags = isSelected ? prev.filter((i) => i !== interestName) : [...prev, interestName]

      // Update the interests string
      setInterests(newTags.join(', '))
      return newTags
    })
  }

  const handleFeedback = useCallback(
    (isPositive: boolean) => {
      const feedbackData = {
        timestamp: Date.now(),
        positive: isPositive,
        searchParams: { recipient, budget, occasion, interests },
        resultsCount: gifts.length,
        userId: auth?.currentUser?.email || 'anonymous',
      }

      // Save to localStorage for future improvements
      try {
        const existingFeedback = JSON.parse(localStorage.getItem('giftfinder_feedback') || '[]')
        existingFeedback.push(feedbackData)
        localStorage.setItem('giftfinder_feedback', JSON.stringify(existingFeedback.slice(-50))) // Keep last 50
      } catch (error) {
        console.error('Failed to save feedback:', error)
      }

      // Track in analytics
      gaSearch(`feedback_${isPositive ? 'positive' : 'negative'}`)
      pinterestSearch(
        `feedback_${isPositive ? 'thumbs_up' : 'thumbs_down'}`,
        `feedback_${Date.now()}`
      )

      showToast(
        isPositive ? '👍 Bedankt voor je feedback!' : '👎 We zullen onze suggesties verbeteren!'
      )
    },
    [recipient, budget, occasion, interests, gifts.length, auth?.currentUser?.email, showToast]
  )

  const handleToggleCompare = (gift: Gift) => {
    setCompareList((prev) => {
      const isAlreadyInList = prev.some((g) => g.productName === gift.productName)
      if (isAlreadyInList) {
        return prev.filter((g) => g.productName !== gift.productName)
      } else {
        if (prev.length >= 3) {
          showToast('Je kunt maximaal 3 cadeaus vergelijken')
          return prev
        }
        return [...prev, gift]
      }
    })
  }

  const handleClearCompare = () => {
    setCompareList([])
    setShowCompareView(false)
  }

  const handleEmailRecap = () => {
    // Get top 5 gifts
    const topGifts = gifts.slice(0, 5)

    // Build email body
    let emailBody = `Hallo!\n\nIk heb deze cadeaus gevonden voor ${recipient.toLowerCase()} voor ${occasion.toLowerCase()}`
    if (interests) {
      emailBody += ` met interesses: ${interests}`
    }
    emailBody += ` en een budget van €${budget}.\n\n`
    emailBody += `Hier zijn mijn top ${topGifts.length} aanbevelingen:\n\n`

    topGifts.forEach((gift, idx) => {
      emailBody += `${idx + 1}. ${gift.productName}\n`
      emailBody += `   ${gift.description}\n`
      emailBody += `   Prijs: ${gift.priceRange}\n`
      if (gift.matchReason) {
        emailBody += `   Waarom: ${gift.matchReason}\n`
      }
      if (gift.retailers && gift.retailers.length > 0) {
        emailBody += `   Link: ${gift.retailers[0].affiliateLink}\n`
      }
      emailBody += `\n`
    })

    emailBody += `\nBekijk alle resultaten op: ${window.location.href}\n\n`
    emailBody += `Veel plezier met het uitkiezen van het perfecte cadeau!\n\nGroetjes,\nGifteez AI`

    // Create mailto link
    const subject = `Mijn Gifteez cadeausuggesties voor ${recipient}`
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`

    // Open email client
    window.location.href = mailtoLink

    // Track analytics
    gaSearch('email_recap_sent')
    showToast('📧 Email wordt geopend...')
  }

  const handleRelevanceFeedbackSubmit = useCallback(async () => {
    if (!relevanceFeedback.trim()) {
      showToast('Laat ons weten wat je mist, dan kunnen we het verbeteren.')
      return
    }

    setFeedbackSubmitting(true)

    try {
      await submitRelevanceFeedback({
        comment: relevanceFeedback.trim(),
        recipient,
        budget,
        occasion,
        interests,
        sampleResults: gifts.slice(0, 3),
      })
      setFeedbackSubmitted(true)
      setRelevanceFeedback('')
      showToast('Bedankt! We sturen dit direct door naar onze scoring-engine.')
    } catch (error) {
      console.error('Failed to submit relevance feedback', error)
      showToast('Oeps, feedback versturen lukte niet. Probeer het later opnieuw.')
    } finally {
      setFeedbackSubmitting(false)
    }
  }, [relevanceFeedback, recipient, budget, occasion, interests, gifts, showToast])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Track GiftFinder usage for FloatingCTA
      localStorage.setItem('giftFinder_lastUse', Date.now().toString())

      // Rate limiting check
      const userId = auth?.currentUser?.email || 'anonymous'
      const rateLimitKey = `search:${userId}`
      if (!rateLimitService.isAllowed(rateLimitKey, 'search')) {
        const timeUntilReset = Math.ceil(rateLimitService.getTimeUntilReset(rateLimitKey) / 1000)
        setError(`Te veel zoekopdrachten. Probeer het over ${timeUntilReset} seconden opnieuw.`)
        showToast(`Rate limit bereikt. Wacht ${timeUntilReset}s.`)
        return
      }

      setIsLoading(true)
      setError(null)
      setGifts([])
      setVisibleCount(6) // Reset to 6 on new search
      setSearchPerformed(true)
      setNoAffiliateResults(false)
      setPersonalizedIntro('')
      setFeedbackSubmitted(false)
      setRelevanceFeedback('')
      setFeedbackSubmitting(false)
      const searchQuery = `${gender} ${recipient} ${occasion} ${interests} budget:€${budget}`
      pinterestSearch(searchQuery, `search_${Date.now()}`)
      gaSearch(searchQuery)
      try {
        const searchParams: GiftSearchParams = { recipient, budget, occasion, interests, gender }
        const results = await findGiftsWithFilters(searchParams)
        const enhancedResults = enhanceGiftsWithMetadata(results)

        // ===== AI ENHANCEMENT: Generate semantic profiles and scores =====

        // 1. Generate user preference profile from inputs
        const selectedInterestsList =
          selectedInterestTags.length > 0
            ? selectedInterestTags
            : interests
              ? interests
                  .split(',')
                  .map((i) => i.trim())
                  .filter(Boolean)
              : []

        const userPreferences = generateUserPreferenceProfile(
          selectedInterestsList,
          occasion || '',
          recipient || ''
        )

        // 2. Log filter event for analytics
        const budgetMin = Math.max(5, budget - 20)
        const budgetMax = budget + 20
        logFilterEvent(
          occasion || undefined,
          recipient || undefined,
          budgetMin,
          budgetMax,
          selectedInterestsList
        )

        // 3. Generate semantic profiles and calculate scores for each gift
        const resultsWithAIScores = enhancedResults.map((gift) => {
          // Generate semantic profile for the gift
          const giftProfile = generateSemanticLabels(
            gift.productName,
            gift.description,
            gift.category || '',
            extractPriceFromRange(gift.priceRange),
            gift.tags || []
          )

          // Calculate AI score with all components
          const score = calculateGiftScore(
            gift,
            giftProfile,
            userPreferences,
            budgetMin,
            budgetMax,
            occasion || '',
            recipient || ''
          )

          return {
            ...gift,
            relevanceScore: score.totalScore,
            budgetFit: score.budgetFit,
            occasionFit: score.occasionFit,
            personaFit: score.personaFit,
            trendScore: score.trendScore,
            explanations: score.explanations,
          }
        })

        // 4. Sort by AI relevance score (highest first)
        resultsWithAIScores.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

        // ===== END AI ENHANCEMENT =====

        // Add match reasons, trending badges, and stories to each gift
        const resultsWithReasons = resultsWithAIScores.map((gift) => {
          const reasons: string[] = []
          let matchingInterests: string[] = []

          // Determine trending badge
          let trendingBadge: 'trending' | 'hot-deal' | 'seasonal' | 'top-rated' | null = null
          const currentMonth = new Date().getMonth() // 0-11

          // Seasonal badges (Oktober = 9)
          if (
            currentMonth === 9 &&
            gift.tags?.some((tag) => tag.toLowerCase().includes('halloween'))
          ) {
            trendingBadge = 'seasonal'
          } else if (
            [10, 11].includes(currentMonth) &&
            gift.tags?.some(
              (tag) =>
                tag.toLowerCase().includes('kerst') || tag.toLowerCase().includes('sinterklaas')
            )
          ) {
            trendingBadge = 'seasonal'
          }

          // Top rated
          if (!trendingBadge && gift.rating && gift.rating >= 4.5) {
            trendingBadge = 'top-rated'
          }

          // Trending (high popularity)
          if (!trendingBadge && gift.popularity && gift.popularity >= 80) {
            trendingBadge = 'trending'
          }

          // Hot deal (good price + good rating)
          const priceForBadge = gift.priceRange?.match(/€(\d+)/)
          if (!trendingBadge && priceForBadge) {
            const price = parseInt(priceForBadge[1])
            if (price < 30 && gift.rating && gift.rating >= 4.0) {
              trendingBadge = 'hot-deal'
            }
          }

          // Check interest match
          if (interests) {
            const interestList = interests
              .toLowerCase()
              .split(',')
              .map((i) => i.trim())
              .filter(Boolean)
            matchingInterests = interestList.filter(
              (interest) =>
                gift.description?.toLowerCase().includes(interest) ||
                gift.category?.toLowerCase().includes(interest) ||
                gift.tags?.some((tag) => tag.toLowerCase().includes(interest))
            )
            if (matchingInterests.length > 0) {
              reasons.push(`Perfect voor ${matchingInterests.join(', ')}-liefhebbers`)
            }
          }

          // Check budget match
          const priceMatch = gift.priceRange?.match(/€(\d+)/)
          if (priceMatch) {
            const price = parseInt(priceMatch[1])
            if (price <= budget) {
              reasons.push(`Binnen je budget van €${budget}`)
            }
          }

          // Check occasion match
          if (
            occasion &&
            gift.tags?.some((tag) => tag.toLowerCase().includes(occasion.toLowerCase()))
          ) {
            reasons.push(`Ideaal voor ${occasion}`)
          }

          // Check rating
          if (gift.rating && gift.rating >= 4) {
            reasons.push(`Hoog gewaardeerd (${gift.rating}/5)`)
          }

          // Check sustainability
          if (gift.sustainability) {
            reasons.push('Duurzame keuze')
          }

          // Default reason if no specific matches
          if (reasons.length === 0) {
            reasons.push(`Geselecteerd voor ${recipient.toLowerCase()}`)
          }

          const retailerBadges = buildRetailerBadges(gift)
          const story = createGiftStory(gift, {
            recipient,
            occasion,
            matchingInterests,
            badges: retailerBadges,
          })

          return {
            ...gift,
            matchReason: reasons.join(' • '),
            trendingBadge,
            retailerBadges,
            story,
          }
        })

        const affiliateResults = processGiftsForAffiliateOnly(resultsWithReasons)
        const finalResults = affiliateResults.length > 0 ? affiliateResults : resultsWithReasons

        setAllGifts(finalResults)

        if (finalResults.length === 0) {
          setNoAffiliateResults(resultsWithReasons.length > 0)
          setGifts([])
          return
        }

        setNoAffiliateResults(affiliateResults.length === 0)
        const sortedResults = sortGifts(finalResults, sortBy)
        setGifts(sortedResults)

        // Generate personalized intro message
        const introMessages = [
          `Op zoek naar een ${interests || 'perfect'} cadeau voor je ${recipient.toLowerCase()} rond €${budget}? Geweldig! Ik heb ${sortedResults.length} ${sortedResults.length === 1 ? 'geweldige optie' : 'geweldige opties'} voor je gevonden...`,
          `Je wilt iemand verrassen voor ${occasion}? Geen probleem! Hier zijn ${sortedResults.length} ${interests ? `${interests}-gerelateerde` : ''} cadeaus binnen je budget van €${budget}.`,
          `Perfect! Voor je ${recipient.toLowerCase()} heb ik ${sortedResults.length} ${occasion.toLowerCase()}-cadeaus ${interests ? `met focus op ${interests}` : ''} geselecteerd.`,
        ]
        const randomIntro = introMessages[Math.floor(Math.random() * introMessages.length)]
        setPersonalizedIntro(randomIntro)

        // Smooth scroll to results after a short delay
        setTimeout(() => {
          document
            .getElementById('gift-results')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.')
        setNoAffiliateResults(false)
      } finally {
        setIsLoading(false)
      }
    },
    [recipient, budget, occasion, interests, sortBy]
  )

  return (
    <>
      <Meta
        title="AI GiftFinder - Vind het perfecte cadeau in 30 seconden | Gifteez"
        description="Gebruik onze slimme GiftFinder om binnen 30 seconden het perfecte cadeau te vinden. Vul budget, interesses en gelegenheid in en ontvang persoonlijke AI-aanbevelingen van Amazon en Coolblue."
      />
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'GiftFinder' }]} />

        {/* Hero achtergrond met nieuwe afbeelding giftfinder-hero.png */}
        <GiftFinderHero
          image="/images/giftfinder-hero-afb.png"
          imageWebp="/images/giftfinder-hero-afb.webp"
          alt="Twee vrolijke cadeaudoos mascottes op paarse achtergrond – start de GiftFinder"
          subheading="Kies wie je wilt verrassen, stel je budget en interesses in en laat onze AI meezoeken."
          onSelectPersonality={() =>
            document.getElementById('giftfinder-form')?.scrollIntoView({ behavior: 'smooth' })
          }
          onStart={() =>
            document.getElementById('giftfinder-form')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
        <div className="h-8 md:h-12" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" id="giftfinder-form">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 space-y-10 -mt-16 relative z-20"
            >
              {auth && auth.currentUser && auth.currentUser.profiles.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl border border-secondary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-primary">
                        Snelstart met een profiel
                      </h3>
                      <p className="text-sm text-gray-600">
                        Laad een opgeslagen profiel voor snelle invoer
                      </p>
                    </div>
                  </div>
                  <select
                    id="profile-select"
                    onChange={handleProfileSelect}
                    defaultValue=""
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                    aria-label="Kies een opgeslagen profiel"
                  >
                    <option value="" disabled>
                      Kies een profiel...
                    </option>
                    {auth.currentUser.profiles.map((p: GiftProfile) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recipient Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">
                      Voor wie zoek je?
                    </h3>
                    <p className="text-sm text-gray-600">Kies de relatie tot de ontvanger</p>
                  </div>
                </div>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                  aria-label="Relatie ontvanger"
                >
                  {recipients.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">
                      Man of vrouw?
                    </h3>
                    <p className="text-sm text-gray-600">Help ons betere suggesties te geven</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {genders.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${gender === g ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <span className="text-2xl">💸</span>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="budget"
                      className="block font-display text-xl font-bold text-primary mb-2"
                    >
                      Wat is je budget?
                    </label>
                    <p className="text-sm text-gray-600">Kies een indicatie van je uitgaven</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">€{budget}</span>
                  </div>
                </div>
                <input
                  id="budget"
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Laag</span>
                  <span>Gemiddeld</span>
                  <span>Premium</span>
                </div>
              </div>

              {/* Occasion Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">
                      Wat is de gelegenheid?
                    </h3>
                    <p className="text-sm text-gray-600">Kies de speciale gelegenheid</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {occasions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOccasion(o)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${occasion === o ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Input */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="interests"
                      className="block font-display text-xl font-bold text-primary mb-2"
                    >
                      Hobby's of interesses?
                    </label>
                    <p className="text-sm text-gray-600">
                      Selecteer interesses of voeg je eigen toe
                    </p>
                  </div>
                </div>

                {/* Visual Interest Tags */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {suggestedInterests.map((interest) => (
                    <button
                      key={interest.name}
                      type="button"
                      onClick={() => handleInterestTagToggle(interest.name)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                        selectedInterestTags.includes(interest.name)
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{interest.icon}</span>
                      <span>{interest.name}</span>
                    </button>
                  ))}
                </div>

                {/* Text input for custom interests */}
                <div className="relative">
                  <label
                    htmlFor="interests"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Of voeg eigen interesses toe:
                  </label>
                  <input
                    id="interests"
                    type="text"
                    value={interests}
                    onChange={(e) => {
                      setInterests(e.target.value)
                      // Clear visual tags if manually typing
                      setSelectedInterestTags([])
                    }}
                    placeholder="bv. Fotografie, Koffie, Yoga"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                      AI zoekt de beste cadeaus...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎁</span>
                      Vind Perfecte Cadeaus
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-16" id="gift-results">
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <GiftResultCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {error && (
                <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
              )}
              {!isLoading &&
                !error &&
                searchPerformed &&
                gifts.length === 0 &&
                (noAffiliateResults ? (
                  <div className="text-center py-12 bg-gradient-to-br from-secondary/10 via-white to-primary/5 border border-secondary/30 rounded-2xl">
                    <EmptyBoxIcon className="w-24 h-24 text-secondary mx-auto" />
                    <h3 className="mt-6 font-display text-2xl font-bold text-primary">
                      Onze partners hebben hier nog niets voor.
                    </h3>
                    <p className="mt-3 text-gray-600 max-w-xl mx-auto">
                      We tonen alleen cadeaus met affiliate commissie. Probeer een andere combinatie
                      of ga direct naar onze favoriete winkels hieronder.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a
                        href="/deals"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                      >
                        🎯 Bekijk alle deals
                      </a>
                      <a
                        href={amazonFallbackUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                      >
                        🛒 Zoeken op Amazon
                      </a>
                      <a
                        href={coolblueFallbackUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                      >
                        💡 Zoeken op Coolblue
                      </a>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                      Links openen in een nieuw tabblad met affiliate tracking.
                    </p>
                    <div className="mt-8 max-w-xl mx-auto bg-white border border-secondary/30 rounded-2xl p-6 shadow-lg text-left">
                      <h4 className="font-display text-lg font-bold text-primary mb-2">
                        📬 Ontvang exclusieve cadeaudeals
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Schrijf je in voor een korte wekelijkse update met Amazon & Coolblue
                        topdeals en ontvang direct onze gratis Cadeau Planner.
                      </p>
                      <a
                        href="/download"
                        onClick={handleLeadMagnetClick}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                      >
                        🎁 Download Cadeau Planner
                      </a>
                      <p className="mt-3 text-xs text-gray-500">
                        Geen spam. Je kunt je altijd uitschrijven.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <EmptyBoxIcon className="w-24 h-24 text-gray-300 mx-auto" />
                    <h3 className="mt-4 font-display text-2xl font-bold text-primary">
                      Oeps, we konden niets vinden!
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Probeer je zoekopdracht wat breder te maken of andere interesses in te vullen.
                    </p>
                  </div>
                ))}
              {gifts.length > 0 && (
                <div className="animate-fade-in">
                  {/* Personalized AI Intro */}
                  {personalizedIntro && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 rounded-xl border-2 border-primary/20 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-full shadow-md">
                          <span className="text-3xl">🤖</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold text-primary mb-2">
                            Jouw Persoonlijke AI Assistent
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{personalizedIntro}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="mb-4 sm:mb-0">
                      <h2 className="font-display text-2xl font-bold text-primary">
                        Hier zijn je AI-cadeautips!
                      </h2>
                      <p className="text-gray-600">
                        {gifts.length} {gifts.length === 1 ? 'cadeau' : 'cadeaus'} gevonden
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">Sorteren op:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          const newSortBy = e.target.value as typeof sortBy
                          setSortBy(newSortBy)
                          setGifts(sortGifts(allGifts, newSortBy))
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      >
                        <option value="relevance">Relevantie</option>
                        <option value="price">Prijs</option>
                        <option value="rating">Waardering</option>
                        <option value="popularity">Populariteit</option>
                      </select>

                      {/* Email Recap Button */}
                      <Button
                        onClick={handleEmailRecap}
                        variant="primary"
                        className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <span className="text-lg">📧</span>
                        <span className="hidden sm:inline">Email deze suggesties</span>
                        <span className="sm:hidden">Email</span>
                      </Button>
                    </div>
                  </div>

                  {/* Compare View Modal */}
                  {showCompareView && compareList.length > 0 && (
                    <div
                      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                      onClick={() => setShowCompareView(false)}
                    >
                      <div
                        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                          <h2 className="font-display text-2xl font-bold text-primary">
                            Vergelijk Cadeaus
                          </h2>
                          <button
                            onClick={() => setShowCompareView(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <span className="text-2xl">✕</span>
                          </button>
                        </div>
                        <div className="p-6">
                          <div
                            className={`grid ${compareList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-6`}
                          >
                            {compareList.map((gift, idx) => (
                              <div
                                key={gift.productName}
                                className="border border-gray-200 rounded-xl p-4 relative"
                              >
                                <button
                                  onClick={() => handleToggleCompare(gift)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ✕
                                </button>
                                <GiftResultCard
                                  gift={gift}
                                  index={idx}
                                  showToast={showToast}
                                  isEmbedded
                                  candidateVariant
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gifts.slice(0, visibleCount).map((gift, index) => (
                      <GiftResultCard
                        key={gift.productName}
                        gift={gift}
                        index={index}
                        showToast={showToast}
                        onCompareToggle={handleToggleCompare}
                        isInCompareList={compareList.some(
                          (g) => g.productName === gift.productName
                        )}
                      />
                    ))}
                  </div>

                  {/* Show More Button */}
                  {gifts.length > visibleCount && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => setVisibleCount((prev) => Math.min(prev + 6, gifts.length))}
                        variant="primary"
                        className="px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Toon meer cadeaus ({gifts.length - visibleCount} verborgen)
                      </Button>
                    </div>
                  )}

                  <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <span className="text-2xl">💬</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-primary">
                          Mis je iets in deze lijst?
                        </h3>
                        <p className="text-sm text-gray-600">
                          Vertel het ons en we sturen het meteen door naar onze scoring-service
                          zodat de volgende zoekopdracht nog beter scoort.
                        </p>
                      </div>
                    </div>
                    {feedbackSubmitted ? (
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                        Dank je wel! Je feedback is ontvangen en wordt meegenomen in onze tuning.
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={relevanceFeedback}
                          onChange={(e) => setRelevanceFeedback(e.target.value)}
                          placeholder="Bijvoorbeeld: Ik zoek iets duurzaams voor sporters, of iets persoonlijks rond 25 euro."
                          className="mt-4 w-full min-h-[120px] p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-800"
                        />
                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                          <Button
                            type="button"
                            onClick={handleRelevanceFeedbackSubmit}
                            disabled={feedbackSubmitting}
                            variant="accent"
                            className="px-6 py-3"
                          >
                            {feedbackSubmitting ? 'Versturen...' : 'Stuur naar AI-team'}
                          </Button>
                          <span className="text-xs text-gray-500">
                            We bewaren alleen de laatste 50 feedbacks om de AI te trainen. Geen
                            e-mail nodig.
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-12 text-center p-6 bg-secondary rounded-lg">
                    <h3 className="font-display text-xl font-bold text-primary">
                      Tevreden met deze suggesties?
                    </h3>
                    <div className="flex justify-center space-x-4 mt-4">
                      <button
                        onClick={() => handleFeedback(true)}
                        className="p-3 rounded-full bg-white shadow-md hover:bg-green-100 transition-all duration-300 transform hover:scale-110"
                        aria-label="Tevreden"
                      >
                        <ThumbsUpIcon className="w-6 h-6 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="p-3 rounded-full bg-white shadow-md hover:bg-red-100 transition-all duration-300 transform hover:scale-110"
                        aria-label="Niet tevreden"
                      >
                        <ThumbsDownIcon className="w-6 h-6 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Internal Links - Related Content */}
                  <div className="mt-16">
                    <h3 className="font-display text-2xl font-bold text-primary mb-6 text-center">
                      💡 Nog meer cadeau opties
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InternalLinkCTA
                        to="/deals"
                        title="🔥 Dagelijkse Deals"
                        description="Bekijk de beste cadeau deals van vandaag met flinke kortingen. Van tech gadgets tot lifestyle producten - altijd scherp geprijsd."
                        icon="💰"
                        variant="accent"
                      />
                      <InternalLinkCTA
                        to="/blog"
                        title="📚 Cadeau Inspiratie"
                        description="Lees onze gidsen en artikelen vol tips, trends en originele cadeau-ideeën voor elke gelegenheid en elk type ontvanger."
                        icon="✨"
                        variant="secondary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Compare Button */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-4">
              <button
                onClick={() => setShowCompareView(true)}
                className="flex items-center gap-2 font-bold hover:scale-105 transition-transform"
              >
                <span className="text-xl">⚖️</span>
                <span>
                  Vergelijk {compareList.length} {compareList.length === 1 ? 'cadeau' : 'cadeaus'}
                </span>
              </button>
              <button
                onClick={handleClearCompare}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Wis vergelijking"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default GiftFinderPage
