import React, { useMemo } from 'react'
import ImageUpload from './ImageUpload'
import type { Gift } from '../types'

export type ParagraphStyle = 'paragraph' | 'bullets' | 'numbered' | 'quote' | 'html'

export interface RetailerDraft {
  id: string
  name: string
  affiliateLink: string
}

export interface GiftDraft {
  productName: string
  description: string
  priceRange: string
  imageUrl: string
  retailers: RetailerDraft[]
  tags: string
  giftType?: Gift['giftType']
  popularity?: number
}

type BaseDraft<T extends string> = {
  id: string
  type: T
}

export type ParagraphBlockDraft = BaseDraft<'paragraph'> & {
  style: ParagraphStyle
  text: string
}

export type HeadingBlockDraft = BaseDraft<'heading'> & {
  text: string
}

export type ImageBlockDraft = BaseDraft<'image'> & {
  src: string
  alt: string
  caption: string
  href: string
}

export type GiftBlockDraft = BaseDraft<'gift'> & {
  gift: GiftDraft
}

export interface FAQItemDraft {
  id: string
  question: string
  answer: string
}

export type FAQBlockDraft = BaseDraft<'faq'> & {
  items: FAQItemDraft[]
}

export type VerdictBlockDraft = BaseDraft<'verdict'> & {
  title: string
  text: string
}

export type UnsupportedBlockDraft = BaseDraft<'unsupported'> & {
  label: string
  details?: string
  original?: unknown
}

export type ContentBlockDraft =
  | ParagraphBlockDraft
  | HeadingBlockDraft
  | ImageBlockDraft
  | GiftBlockDraft
  | FAQBlockDraft
  | VerdictBlockDraft
  | UnsupportedBlockDraft

interface ContentBuilderProps {
  value: ContentBlockDraft[]
  onChange: (value: ContentBlockDraft[]) => void
  onMove?: (fromIndex: number, toIndex: number) => void
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `block-${Math.random().toString(36).slice(2, 10)}`
}

const createEmptyDraft = (type: ContentBlockDraft['type']): ContentBlockDraft => {
  switch (type) {
    case 'heading':
      return { id: generateId(), type: 'heading', text: '' }
    case 'paragraph':
      return { id: generateId(), type: 'paragraph', style: 'paragraph', text: '' }
    case 'image':
      return { id: generateId(), type: 'image', src: '', alt: '', caption: '', href: '' }
    case 'gift':
      return {
        id: generateId(),
        type: 'gift',
        gift: {
          productName: '',
          description: '',
          priceRange: '',
          imageUrl: '',
          retailers: [{ id: generateId(), name: '', affiliateLink: '' }],
          tags: '',
        },
      }
    case 'faq':
      return {
        id: generateId(),
        type: 'faq',
        items: [{ id: generateId(), question: '', answer: '' }],
      }
    case 'verdict':
      return {
        id: generateId(),
        type: 'verdict',
        title: '',
        text: '',
      }
    default:
      return { id: generateId(), type: 'unsupported', label: 'Onbekend blok' }
  }
}

const styleOptions: { value: ParagraphStyle; label: string }[] = [
  { value: 'paragraph', label: 'Standaard paragraaf' },
  { value: 'bullets', label: 'Bullet lijst' },
  { value: 'numbered', label: 'Genummerde lijst' },
  { value: 'quote', label: 'Quote/Highlight' },
  { value: 'html', label: 'HTML (gevorderd)' },
]

const blockTypeOptions: { value: ContentBlockDraft['type']; label: string }[] = [
  { value: 'heading', label: 'Koptekst' },
  { value: 'paragraph', label: 'Tekstblok' },
  { value: 'image', label: 'Afbeelding' },
  { value: 'gift', label: 'Product highlight' },
  { value: 'faq', label: 'FAQ sectie' },
  { value: 'verdict', label: 'Eindoordeel' },
]

interface TemplateOption {
  id: string
  label: string
  description: string
  build: () => ContentBlockDraft[]
}

const CONTENT_TEMPLATES: TemplateOption[] = [
  {
    id: 'review-basic',
    label: 'Review basis',
    description: 'Intro, productblok, pluspunten en eindoordeel',
    build: () => {
      const introHeading = createEmptyDraft('heading') as HeadingBlockDraft
      introHeading.text = 'Waarom dit cadeau werkt'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.style = 'paragraph'
      introParagraph.text =
        'Start met een korte introductie over voor wie dit cadeau bedoeld is en waarom het relevant is.'

      const productHeading = createEmptyDraft('heading') as HeadingBlockDraft
      productHeading.text = 'Product highlight'

      const giftBlock = createEmptyDraft('gift') as GiftBlockDraft

      const prosHeading = createEmptyDraft('heading') as HeadingBlockDraft
      prosHeading.text = 'Pluspunten & aandachtspunten'

      const prosParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      prosParagraph.style = 'bullets'
      prosParagraph.text = 'Pluspunt 1\nPluspunt 2\nAandachtspunt 1'

      const verdictBlock = createEmptyDraft('verdict') as VerdictBlockDraft
      verdictBlock.title = 'Ons oordeel'
      verdictBlock.text =
        'Vat het cadeau samen in één krachtige alinea. Benoem voor wie het perfect is en wat de ervaring bijzonder maakt.'

      return [
        introHeading,
        introParagraph,
        productHeading,
        giftBlock,
        prosHeading,
        prosParagraph,
        verdictBlock,
      ]
    },
  },
  {
    id: 'marketing-highlight',
    label: 'Marketing highlight blok',
    description: 'Hero-intro met chips en benefit bullets',
    build: () => {
      const highlightBlock = createEmptyDraft('paragraph') as ParagraphBlockDraft
      highlightBlock.style = 'html'
      highlightBlock.text = `<div class="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 md:p-5">
  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-500">Waarom dit cadeau werkt</p>
  <p class="mb-3 text-sm text-gray-700">Gebruik dit blok om in 2-3 zinnen de belofte van het cadeau samen te vatten. Benoem voor wie het ideaal is en welk probleem je oplost.</p>
  <div class="flex flex-wrap gap-2">
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">✔️ Benefit 1</span>
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">✔️ Benefit 2</span>
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">✔️ Benefit 3</span>
  </div>
</div>`

      return [highlightBlock]
    },
  },
  {
    id: 'dutch-gifts-2025',
    label: '8 NL cadeaus (2025)',
    description: 'Volledige gids met intro, thema’s en productblokken',
    build: () => {
      const introHeading = createEmptyDraft('heading') as HeadingBlockDraft
      introHeading.text = '8 originele Nederlandse cadeaus voor 2025'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.text =
        'Introduceer de gids in 3-4 zinnen. Benoem waarom Nederlandse makers, lokale beleving en duurzame keuzes in 2025 scoren.'

      const keyTakeaways = createEmptyDraft('paragraph') as ParagraphBlockDraft
      keyTakeaways.style = 'quote'
      keyTakeaways.text =
        'Tip: benoem per cadeau het verhaal van de maker en hoe de ontvanger er direct iets mee kan. Voeg een downloadbare checklist toe voor extra waarde.'

      const categoryHeading = createEmptyDraft('heading') as HeadingBlockDraft
      categoryHeading.text = 'Categorieën die je kunt uitlichten'

      const categoryList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      categoryList.style = 'bullets'
      categoryList.text =
        'Design & interieurcadeaus van Nederlandse bodem\nErvaring & uitjes (culinair, wellness, avontuur)\nDuurzame must-haves met circulaire roots\nTech & smart home gadgets met NL design\nKids & familie – lokaal gemaakte spellen en workshops'

      const gift1 = createEmptyDraft('gift') as GiftBlockDraft
      gift1.gift.productName = 'Cadeau idee #1: Design-icon van een Nederlandse maker'
      gift1.gift.description =
        'Beschrijf waarom het product typisch Nederlands is, welke materialen worden gebruikt en voor welk type ontvanger het perfect is.'

      const gift2 = createEmptyDraft('gift') as GiftBlockDraft
      gift2.gift.productName = 'Cadeau idee #2: Lokaal foodie- of wellness-arrangement'
      gift2.gift.description =
        'Vertel hoe de ervaring verloopt, welke partnerbedrijven betrokken zijn en hoe je er een persoonlijk verhaal van maakt.'

      const gift3 = createEmptyDraft('gift') as GiftBlockDraft
      gift3.gift.productName = 'Cadeau idee #3: Slimme gadget met Dutch twist'
      gift3.gift.description =
        'Leg uit wat de innovatie is, wanneer het cadeau het meest impact maakt en hoe je extra accessoires kunt toevoegen.'

      const bundleHeading = createEmptyDraft('heading') as HeadingBlockDraft
      bundleHeading.text = 'Zo vertel je het complete verhaal'

      const bundleParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      bundleParagraph.text =
        'Combineer elk cadeau met een mini “maak het af” pakket (bijv. kaartje, lokale lekkernij, printable roadmap). Voeg een tabel of bulletlijst toe met budget-range en levertijd om lezers te helpen kiezen.'

      const ctaHeading = createEmptyDraft('heading') as HeadingBlockDraft
      ctaHeading.text = 'Klaar om je Nederlandse cadeaugids te publiceren?'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        'Sluit af met een duidelijke call-to-action: link naar de GiftFinder, een downloadbare lijst of het contactformulier voor maatwerk advies. Herinner de lezer eraan dat alle cadeaus lokaal beschikbaar zijn.'

      return [
        introHeading,
        introParagraph,
        keyTakeaways,
        categoryHeading,
        categoryList,
        gift1,
        gift2,
        gift3,
        bundleHeading,
        bundleParagraph,
        ctaHeading,
        ctaParagraph,
      ]
    },
  },
  {
    id: 'smart-gifting-guide',
    label: 'Perfect cadeau kiezen gids',
    description: 'Stap-voor-stap handleiding voor slimme gevers',
    build: () => {
      const heroHeading = createEmptyDraft('heading') as HeadingBlockDraft
      heroHeading.text = 'Hoe kies je het perfecte cadeau? Een gids voor slimme gevers'

      const promiseParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      promiseParagraph.text =
        'Start met een teaser: in deze gids leer je hoe je behoeften ontdekt, budget bewaakt en cadeaus persoonlijk maakt zonder stress.'

      const stepsHeading = createEmptyDraft('heading') as HeadingBlockDraft
      stepsHeading.text = '3 stappen om tot een wauw-moment te komen'

      const stepsList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      stepsList.style = 'numbered'
      stepsList.text =
        'Leer de ontvanger écht kennen (gebruik mini-interviews of signalen)\nBepaal het cadeau-profiel: praktisch, emotioneel of experimenteel\nVoeg een persoonlijke twist toe met een verhaal, kaart of mini-kit'

      const researchHeading = createEmptyDraft('heading') as HeadingBlockDraft
      researchHeading.text = 'Checklist: wat verzamel je vooraf?'

      const researchBullets = createEmptyDraft('paragraph') as ParagraphBlockDraft
      researchBullets.style = 'bullets'
      researchBullets.text =
        'Hobby’s en routines van de ontvanger\nBelangrijke data (jubilea, behaalde mijlpalen)\nFavoriete merken en duurzame voorkeuren\nBeschikbaar budget + opties om cadeaus te bundelen\nMoment waarop het cadeau wordt gegeven (intiem, zakelijk, groep)'

      const giftExample = createEmptyDraft('gift') as GiftBlockDraft
      giftExample.gift.productName = 'Voorbeeldcadeau: Slimme keuze met persoonlijke touch'
      giftExample.gift.description =
        'Beschrijf een concreet voorbeeld. Toon hoe het past bij de verzamelde inzichten en welke accessoires of downloadables je toevoegt.'

      const personalizationHeading = createEmptyDraft('heading') as HeadingBlockDraft
      personalizationHeading.text = 'Maak het persoonlijk'

      const personalizationParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      personalizationParagraph.text =
        'Leg uit hoe je storytelling, handgeschreven notities, een thematische verpakking of een gedeelde ervaring toevoegt. Stimuleer de lezer om templates of checklist te downloaden.'

      const pitfallsHeading = createEmptyDraft('heading') as HeadingBlockDraft
      pitfallsHeading.text = 'Veelgemaakte fouten om te vermijden'

      const pitfallsList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      pitfallsList.style = 'bullets'
      pitfallsList.text =
        'Laten leiden door je eigen smaak in plaats van die van de ontvanger\nTe laat beginnen waardoor keuze stressvol wordt\nGeen aandacht voor aftercare (garantie, retourneren, uitleg)\nVergeten te checken of cadeaus al in bezit zijn'

      const summaryHeading = createEmptyDraft('heading') as HeadingBlockDraft
      summaryHeading.text = 'Van inzicht naar actie'

      const summaryParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      summaryParagraph.text =
        'Vat samen: plan 15 minuten voor research, kies een cadeau-profiel, test het idee bij een vertrouweling en voeg vervolgens een persoonlijke twist toe. Eindig met een uitnodiging naar de GiftFinder of een downloadbare briefingssheet.'

      return [
        heroHeading,
        promiseParagraph,
        stepsHeading,
        stepsList,
        researchHeading,
        researchBullets,
        giftExample,
        personalizationHeading,
        personalizationParagraph,
        pitfallsHeading,
        pitfallsList,
        summaryHeading,
        summaryParagraph,
      ]
    },
  },
  {
    id: 'trend-report-2025',
    label: 'Cadeautrends 2025',
    description: 'Trendrapport met highlights, data en call-to-actions',
    build: () => {
      const heroHeading = createEmptyDraft('heading') as HeadingBlockDraft
      heroHeading.text = 'Cadeautrends 2025: wat wordt populair?'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.text =
        'Schets in 2-3 zinnen het cadeau-landschap van 2025. Gebruik data of observaties (bijv. duurzaamheid, AI, beleving) om de lezer direct te boeien.'

      const trendListHeading = createEmptyDraft('heading') as HeadingBlockDraft
      trendListHeading.text = 'Top 4 trends om nu op te letten'

      const trendList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      trendList.style = 'bullets'
      trendList.text =
        'Bewuste luxe: duurzame materialen & lokale productie\nHybride experiences: fysiek cadeau + digitale bonus\nAI-personalisatie: cadeaus op maat met data en tools\nWell-being & focus: cadeaus voor herstel, ontspanning en concentratie'

      const dataSpotlightHeading = createEmptyDraft('heading') as HeadingBlockDraft
      dataSpotlightHeading.text = 'Data spotlight of expertquote'

      const dataParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      dataParagraph.text =
        'Voeg hier een quote van een expert, klant of onderzoek toe. Bijvoorbeeld: “71% van de cadeaukopers kiest in 2025 voor een experience-bundel.” Gebruik dit als bewijs voor de gekozen trends.'

      const giftBundle = createEmptyDraft('gift') as GiftBlockDraft
      giftBundle.gift.productName = 'Trend voorbeeld: Experience + fysiek cadeau'
      giftBundle.gift.description =
        'Laat zien hoe je een trending bundle samenstelt (bijv. wellness retreat + giftbox). Beschrijf de doelgroep en het prijsniveau.'

      const playbookHeading = createEmptyDraft('heading') as HeadingBlockDraft
      playbookHeading.text = 'Zo vertaal je trends naar concrete cadeaus'

      const playbookParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      playbookParagraph.text =
        'Gebruik een korte mini-playbook: kies trend > bepaal doelgroep > selecteer product + ervaring > voeg persoonlijke twist toe. Geef tips voor upsells of limited editions.'

      const forecastHeading = createEmptyDraft('heading') as HeadingBlockDraft
      forecastHeading.text = 'Vooruitblik & volgende stappen'

      const forecastParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      forecastParagraph.text =
        'Sluit af met een vooruitblik op Q2/Q3 2025 en link naar aanvullende resources: download rapport, abonneer op nieuwsbrief, probeer GiftFinder of plan een consult.'

      return [
        heroHeading,
        introParagraph,
        trendListHeading,
        trendList,
        dataSpotlightHeading,
        dataParagraph,
        giftBundle,
        playbookHeading,
        playbookParagraph,
        forecastHeading,
        forecastParagraph,
      ]
    },
  },
  {
    id: 'audience-gift-ideas',
    label: 'Cadeau-ideeën per ontvanger',
    description: 'Matrix met segmenten en ingevulde voorbeelden',
    build: () => {
      const introHeading = createEmptyDraft('heading') as HeadingBlockDraft
      introHeading.text = 'Cadeau-ideeën per type ontvanger'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.text =
        'Leg uit dat de gids vier doelgroepen behandelt (voor haar, voor hem, tech-liefhebbers, minimalisten) en hoe lezers snel kunnen filteren.'

      const tableHint = createEmptyDraft('paragraph') as ParagraphBlockDraft
      tableHint.style = 'quote'
      tableHint.text =
        'Tip: overweeg een matrix of tabel zodat lezers in één oogopslag zien welk cadeau bij welk profiel past. Voeg kolommen toe voor prijsrange en leveringsopties.'

      const forHerHeading = createEmptyDraft('heading') as HeadingBlockDraft
      forHerHeading.text = 'Voor haar: betekenisvolle & belevinggerichte cadeaus'

      const forHerList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      forHerList.style = 'bullets'
      forHerList.text =
        'Self-care of wellness kit met persoonlijke boodschap\nCreatieve workshop of cursus (bloemschikken, keramiek)\nPremium dagelijkse luxe upgrade (koffie, skincare, tech)'

      const forHerGift = createEmptyDraft('gift') as GiftBlockDraft
      forHerGift.gift.productName = 'Voorbeeldcadeau voor haar'
      forHerGift.gift.description =
        'Beschrijf een concreet cadeau en hoe je het personaliseert (initialen, playlist, printables).'

      const forHimHeading = createEmptyDraft('heading') as HeadingBlockDraft
      forHimHeading.text = 'Voor hem: van smart upgrades tot smaakmakers'

      const forHimList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      forHimList.style = 'bullets'
      forHimList.text =
        'Smart home of productivity gadget\nErvaring: tasting, rally, workshop\nLimited edition accessoires (horloge, schoenen, tools)'

      const forHimGift = createEmptyDraft('gift') as GiftBlockDraft
      forHimGift.gift.productName = 'Voorbeeldcadeau voor hem'
      forHimGift.gift.description =
        'Geef richting: benoem doel, bundels en hoe je alles stijlvol inpakt.'

      const techHeading = createEmptyDraft('heading') as HeadingBlockDraft
      techHeading.text = 'Tech-liefhebbers: future-proof en fun'

      const techList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      techList.style = 'bullets'
      techList.text =
        'AI-gestuurde gadgets of smart assistants\nModulaire setups (gaming, audio, fotografie)\nDIY kits (robotica, 3D-printing, elektronica)'

      const techGift = createEmptyDraft('gift') as GiftBlockDraft
      techGift.gift.productName = 'Voorbeeldcadeau tech-liefhebber'
      techGift.gift.description =
        'Beschrijf hoe het cadeau inspeelt op innovatie, en welke accessoires of abonnementen je kunt toevoegen.'

      const minimalistHeading = createEmptyDraft('heading') as HeadingBlockDraft
      minimalistHeading.text = 'Minimalisten: functioneel, mindful en compact'

      const minimalistList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      minimalistList.style = 'bullets'
      minimalistList.text =
        'Premium essentials met lange levensduur\nDigitale cadeaus (apps, memberships)\nExperience zonder spullen (micro-escapes, coaching)'

      const minimalistGift = createEmptyDraft('gift') as GiftBlockDraft
      minimalistGift.gift.productName = 'Voorbeeldcadeau minimalist'
      minimalistGift.gift.description =
        'Toon hoe je het cadeau klein maar impactvol houdt. Voeg eventueel een downloadbare mindful routine toe.'

      const wrapUpHeading = createEmptyDraft('heading') as HeadingBlockDraft
      wrapUpHeading.text = 'Zo kies je snel het juiste segment'

      const wrapUpParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      wrapUpParagraph.text =
        'Geef lezers een korte beslisboom: kies de hoofdcategorie, check lifestyle en voeg één persoonlijk element toe. Verwijs naar GiftFinder of een intakeformulier voor maatwerk advies.'

      return [
        introHeading,
        introParagraph,
        tableHint,
        forHerHeading,
        forHerList,
        forHerGift,
        forHimHeading,
        forHimList,
        forHimGift,
        techHeading,
        techList,
        techGift,
        minimalistHeading,
        minimalistList,
        minimalistGift,
        wrapUpHeading,
        wrapUpParagraph,
      ]
    },
  },
  {
    id: 'lead-magnet-landing',
    label: 'Download / lead magnet',
    description: 'Landing voor checklists, e-books of printables',
    build: () => {
      const heroHeading = createEmptyDraft('heading') as HeadingBlockDraft
      heroHeading.text = 'Download: [Titel van je lead magnet]'

      const teaserParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      teaserParagraph.text =
        'Introduceer in 2-3 zinnen welk probleem je oplost, hoeveel tijd het scheelt en waarom de download uniek is.'

      const highlightBlock = createEmptyDraft('paragraph') as ParagraphBlockDraft
      highlightBlock.style = 'html'
      highlightBlock.text = `<div class="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 md:p-5">
  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">Wat je krijgt</p>
  <p class="mb-3 text-sm text-gray-700">Som kort de drie grootste voordelen of resultaten op die ontvangers direct ervaren.</p>
  <div class="flex flex-wrap gap-2">
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">✔️ Resultaat 1</span>
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">✔️ Resultaat 2</span>
    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">✔️ Resultaat 3</span>
  </div>
</div>`

      const downloadGift = createEmptyDraft('gift') as GiftBlockDraft
      downloadGift.gift.productName = 'Lead magnet: naam van je download'
      downloadGift.gift.description =
        'Beschrijf het format (PDF, checklist, e-mailserie) en noem de belangrijkste hoofdstukken of modules.'
      downloadGift.gift.priceRange = 'Gratis'
      downloadGift.gift.tags = 'download, lead magnet'

      const socialProof = createEmptyDraft('paragraph') as ParagraphBlockDraft
      socialProof.style = 'quote'
      socialProof.text =
        'Plaats hier een korte testimonial of quote van iemand die dankzij de download sneller het perfecte cadeau vond.'

      const faqBlock = createEmptyDraft('faq') as FAQBlockDraft
      if (faqBlock.items.length) {
        faqBlock.items[0].question = 'Hoe ontvang ik de download?'
        faqBlock.items[0].answer =
          'Leg uit of de lezer een e-mail ontvangt, direct kan downloaden of beiden. Verwijs naar je privacy-belofte.'
      }
      faqBlock.items.push({
        id: generateId(),
        question: 'Mag ik het materiaal delen?',
        answer:
          'Beschrijf of delen met vrienden/collega’s mag en of je een bronvermelding wilt. Stimuleer het delen vanaf je eigen landing.',
      })

      const ctaHeading = createEmptyDraft('heading') as HeadingBlockDraft
      ctaHeading.text = 'Download nu en begin direct'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        '👉 Voeg hier je downloadknop toe, eventueel met een veld voor e-mailadres of een link naar de nieuwsbrief. Benoem nogmaals het directe resultaat.'

      return [
        heroHeading,
        teaserParagraph,
        highlightBlock,
        downloadGift,
        socialProof,
        faqBlock,
        ctaHeading,
        ctaParagraph,
      ]
    },
  },
  {
    id: 'gift-comparison',
    label: 'Cadeauvergelijker',
    description: 'Vergelijk twee toppers en help bij twijfel',
    build: () => {
      const introHeading = createEmptyDraft('heading') as HeadingBlockDraft
      introHeading.text = 'Cadeauvergelijker: kies tussen [Optie A] en [Optie B]'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.text =
        'Leg in 2-3 zinnen uit voor welk type koper deze keuze lastig is en wat de belangrijkste verschillen zijn.'

      const firstGift = createEmptyDraft('gift') as GiftBlockDraft
      firstGift.gift.productName = 'Optie A: noem het cadeau'
      firstGift.gift.description =
        'Beschrijf wat deze optie uniek maakt, inclusief prijsrange en situaties waarin hij het beste werkt.'

      const secondGift = createEmptyDraft('gift') as GiftBlockDraft
      secondGift.gift.productName = 'Optie B: noem het cadeau'
      secondGift.gift.description =
        'Vertel wanneer je voor deze variant kiest en welke extra’s of accessoires het verschil maken.'

      const decisionSteps = createEmptyDraft('paragraph') as ParagraphBlockDraft
      decisionSteps.style = 'numbered'
      decisionSteps.text =
        'Bepaal de hoofddoelstelling van de ontvanger\nCheck het budget en gewenste leveringsmoment\nBeslis: kies de optie die het grootste “nu gebruiken” effect heeft'

      const comparisonTable = createEmptyDraft('paragraph') as ParagraphBlockDraft
      comparisonTable.style = 'html'
      comparisonTable.text = `<table class="w-full text-sm">
  <thead>
    <tr class="text-left text-gray-600">
      <th class="pb-2">Kenmerk</th>
      <th class="pb-2">Optie A</th>
      <th class="pb-2">Optie B</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
    <tr>
      <td class="py-2 font-medium text-gray-700">Prijsrange</td>
      <td class="py-2">€ …</td>
      <td class="py-2">€ …</td>
    </tr>
    <tr>
      <td class="py-2 font-medium text-gray-700">Voor wie</td>
      <td class="py-2">Beschrijf doelgroep</td>
      <td class="py-2">Beschrijf doelgroep</td>
    </tr>
    <tr>
      <td class="py-2 font-medium text-gray-700">Pluspunten</td>
      <td class="py-2">Opsomming</td>
      <td class="py-2">Opsomming</td>
    </tr>
  </tbody>
</table>`

      const verdictBlock = createEmptyDraft('verdict') as VerdictBlockDraft
      verdictBlock.title = 'Wie wint voor wie?'
      verdictBlock.text =
        'Vat samen welke optie je adviseert voor verschillende profielen (bijv. budget, luxe, snelheid). Zet de lezer aan tot kiezen.'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        '👉 Link naar beide producten, een GiftFinder quiz of een intakeformulier voor persoonlijk advies. Tip: voeg een kortingscode toe als die beschikbaar is.'

      return [
        introHeading,
        introParagraph,
        firstGift,
        secondGift,
        decisionSteps,
        comparisonTable,
        verdictBlock,
        ctaParagraph,
      ]
    },
  },
  {
    id: 'seasonal-campaign',
    label: 'Seizoenscampagne',
    description: 'Thematische gids voor piekperiodes',
    build: () => {
      const heroHeading = createEmptyDraft('heading') as HeadingBlockDraft
      heroHeading.text = 'Seizoenscampagne: [Naam van je moment] 2025'

      const heroParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      heroParagraph.text =
        'Introduceer het seizoen of event, benoem belangrijke data en waarom dit dé kans is om een memorabel cadeau te geven.'

      const trendBullets = createEmptyDraft('paragraph') as ParagraphBlockDraft
      trendBullets.style = 'bullets'
      trendBullets.text =
        'Trend of thema 1 met korte uitleg\nTrend of thema 2 met korte uitleg\nTrend of thema 3 met korte uitleg'

      const giftOne = createEmptyDraft('gift') as GiftBlockDraft
      giftOne.gift.productName = 'Seizoenscadeau #1'
      giftOne.gift.description =
        'Beschrijf waarom dit cadeau perfect bij het thema past en hoe je het feestelijk presenteert.'

      const giftTwo = createEmptyDraft('gift') as GiftBlockDraft
      giftTwo.gift.productName = 'Seizoenscadeau #2'
      giftTwo.gift.description =
        'Noem varianten op verschillende budgetten en welke extra’s je kunt toevoegen.'

      const giftThree = createEmptyDraft('gift') as GiftBlockDraft
      giftThree.gift.productName = 'Seizoenscadeau #3'
      giftThree.gift.description =
        'Focus op snelheid of last-minute mogelijkheden, inclusief digitale varianten indien relevant.'

      const planningTip = createEmptyDraft('paragraph') as ParagraphBlockDraft
      planningTip.style = 'quote'
      planningTip.text =
        'Deel een slimme planningstip: bijv. “Bestel voor [datum] om levering op tijd te garanderen” of een checklist met verpakkingsideeën.'

      const ctaHeading = createEmptyDraft('heading') as HeadingBlockDraft
      ctaHeading.text = 'Plan je seizoensverrassing'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        '👉 Voeg links toe naar je GiftFinder, deals-pagina of een downloadbare cadeaugids. Benoem deadlines en mogelijke bundels.'

      const faqBlock = createEmptyDraft('faq') as FAQBlockDraft
      if (faqBlock.items.length) {
        faqBlock.items[0].question = 'Hoe zit het met levertijden en drukte?'
        faqBlock.items[0].answer =
          'Geef advies over bestellen, personaliseren en retouren tijdens piekperiodes. Verwijs naar je klantenservice voor maatwerk.'
      }
      faqBlock.items.push({
        id: generateId(),
        question: 'Kan ik meerdere cadeaus bundelen?',
        answer:
          'Leg uit hoe je bundels samenstelt, of je cadeaukaarten toevoegt en welke verpakking je aanraadt voor een premium gevoel.',
      })

      return [
        heroHeading,
        heroParagraph,
        trendBullets,
        giftOne,
        giftTwo,
        giftThree,
        planningTip,
        ctaHeading,
        ctaParagraph,
        faqBlock,
      ]
    },
  },
  {
    id: 'b2b-gift-program',
    label: 'Zakelijk cadeauprogramma',
    description: 'B2B verhaal voor relaties, teams of events',
    build: () => {
      const introHeading = createEmptyDraft('heading') as HeadingBlockDraft
      introHeading.text = 'Zakelijk cadeauprogramma: verhoog merkbeleving & retentie'

      const introParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      introParagraph.text =
        'Schets het scenario: klanten bedanken, medewerkers motiveren of leads nurture tijdens events. Benoem de gewenste impact.'

      const goalsList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      goalsList.style = 'bullets'
      goalsList.text =
        'Doel 1 – bijv. loyaliteit verhogen\nDoel 2 – bijv. merkvoorkeur versterken\nDoel 3 – bijv. ambassadeurs activeren'

      const heroGift = createEmptyDraft('gift') as GiftBlockDraft
      heroGift.gift.productName = 'Signature cadeaupakket'
      heroGift.gift.description =
        'Beschrijf het hoofdproduct (bijv. premium box) en hoe je branding en personalisatie toevoegt.'

      const experienceGift = createEmptyDraft('gift') as GiftBlockDraft
      experienceGift.gift.productName = 'Experience of teambuilding upgrade'
      experienceGift.gift.description =
        'Leg uit hoe een workshop, tasting of retreat het pakket memorabel maakt en welke follow-up je plant.'

      const sustainableGift = createEmptyDraft('gift') as GiftBlockDraft
      sustainableGift.gift.productName = 'Duurzaam alternatief'
      sustainableGift.gift.description =
        'Noem materialen, MVO-initiatieven en manieren om impact te meten of te communiceren.'

      const impactHighlight = createEmptyDraft('paragraph') as ParagraphBlockDraft
      impactHighlight.style = 'html'
      impactHighlight.text = `<div class="rounded-xl border border-sky-100 bg-sky-50 p-4">
  <p class="text-sm font-semibold text-sky-700">Mini-case of KPI highlight</p>
  <p class="text-sm text-sky-700">Gebruik dit blok voor een korte case (bijv. 87% hogere tevredenheid) of een quote van een zakelijke klant.</p>
</div>`

      const faqBlock = createEmptyDraft('faq') as FAQBlockDraft
      if (faqBlock.items.length) {
        faqBlock.items[0].question = 'Wat is het minimale afnamevolume?'
        faqBlock.items[0].answer =
          'Beschrijf ordergroottes, levertijd en personalisatieopties. Verwijs naar een contactpersoon voor maatwerk.'
      }
      faqBlock.items.push({
        id: generateId(),
        question: 'Hoe verloopt de logistiek?',
        answer:
          'Leg uit hoe je verzending, track & trace en internationale leveringen regelt. Noem mogelijkheden voor individuele adressering.',
      })

      const verdictBlock = createEmptyDraft('verdict') as VerdictBlockDraft
      verdictBlock.title = 'Van idee naar lancering'
      verdictBlock.text =
        'Vat samen hoe je in drie stappen van concept naar realisatie gaat: strategie bepalen, pakketten samenstellen, logistiek inregelen. Nodig uit voor een intakegesprek of demo.'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        '👉 Voeg een link toe naar je contactformulier, offerte-aanvraag of calendly. Benoem een concrete call-to-action zoals “Plan een 20-min callsessie”.'

      return [
        introHeading,
        introParagraph,
        goalsList,
        heroGift,
        experienceGift,
        sustainableGift,
        impactHighlight,
        faqBlock,
        verdictBlock,
        ctaParagraph,
      ]
    },
  },
  {
    id: 'gift-story-case',
    label: 'Case: cadeau in actie',
    description: 'Storytelling-template met praktijkvoorbeeld',
    build: () => {
      const heroHeading = createEmptyDraft('heading') as HeadingBlockDraft
      heroHeading.text = 'Case study: hoe [naam ontvanger] een onvergetelijk moment beleefde'

      const scenarioParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      scenarioParagraph.text =
        'Schets in 2-3 zinnen de beginsituatie: wie is de ontvanger, wat was de gelegenheid en welke uitdaging wilde je oplossen?'

      const quoteHighlight = createEmptyDraft('paragraph') as ParagraphBlockDraft
      quoteHighlight.style = 'quote'
      quoteHighlight.text =
        'Voeg hier een directe quote toe van de gever of ontvanger voor emotionele impact.'

      const heroGift = createEmptyDraft('gift') as GiftBlockDraft
      heroGift.gift.productName = 'Het gekozen cadeau'
      heroGift.gift.description =
        'Beschrijf het cadeau, waarom het perfect paste en welke personalisaties of accessoires zijn toegevoegd.'

      const outcomeList = createEmptyDraft('paragraph') as ParagraphBlockDraft
      outcomeList.style = 'bullets'
      outcomeList.text =
        'Resultaat 1 – wat veranderde er direct?\nResultaat 2 – welke reactie gaf de ontvanger?\nResultaat 3 – welk langetermijneffect verwacht je?'

      const lessonParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      lessonParagraph.text =
        'Deel de belangrijkste lessen of tips zodat lezers het scenario kunnen kopiëren voor hun eigen situatie. Verwijs naar ondersteunend materiaal (checklist, download, video).'

      const verdictBlock = createEmptyDraft('verdict') as VerdictBlockDraft
      verdictBlock.title = 'Wat jij hiervan kunt leren'
      verdictBlock.text =
        'Vat in één alinea samen voor wie dit cadeau-format werkt, welke fouten je vermijdt en hoe lezers het binnen 24 uur kunnen voorbereiden.'

      const ctaParagraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      ctaParagraph.text =
        '👉 Voeg een call-to-action toe om je eigen case te plannen: link naar GiftFinder resultaten, een intakeformulier of gerelateerde gidsen.'

      return [
        heroHeading,
        scenarioParagraph,
        quoteHighlight,
        heroGift,
        outcomeList,
        lessonParagraph,
        verdictBlock,
        ctaParagraph,
      ]
    },
  },
  {
    id: 'faq-section',
    label: 'FAQ sectie',
    description: 'Klaar voor snelle vragen & antwoorden',
    build: () => {
      const heading = createEmptyDraft('heading') as HeadingBlockDraft
      heading.text = 'Veelgestelde vragen'

      const faqBlock = createEmptyDraft('faq') as FAQBlockDraft
      if (faqBlock.items.length) {
        faqBlock.items[0].question = 'Loopt dit cadeau goed in de praktijk?'
        faqBlock.items[0].answer = 'Geef hier een kort antwoord dat onzekerheden wegneemt.'
      }
      faqBlock.items.push({
        id: generateId(),
        question: 'Hoe presenteer ik dit het beste?',
        answer: 'Beschrijf hoe je het cadeau extra persoonlijk maakt.',
      })

      return [heading, faqBlock]
    },
  },
  {
    id: 'cta-closer',
    label: 'Call-to-action afsluiter',
    description: 'Sterke afsluiting met CTA en links',
    build: () => {
      const heading = createEmptyDraft('heading') as HeadingBlockDraft
      heading.text = 'Klaar om iemand te verrassen?'

      const paragraph = createEmptyDraft('paragraph') as ParagraphBlockDraft
      paragraph.style = 'paragraph'
      paragraph.text =
        '👉 Voeg je belangrijkste links toe (affiliate, checklist, giftfinder) en sluit af met een persoonlijke uitnodiging of challenge voor de lezer.'

      return [heading, paragraph]
    },
  },
]

const labelForBlock = (block: ContentBlockDraft, index: number): string => {
  switch (block.type) {
    case 'heading':
      return block.text ? `Kop: ${block.text}` : `Kop ${index + 1}`
    case 'paragraph':
      return block.text ? `Paragraaf: ${block.text.slice(0, 40)}…` : `Paragraaf ${index + 1}`
    case 'image':
      return block.alt ? `Afbeelding: ${block.alt}` : `Afbeelding ${index + 1}`
    case 'gift':
      return block.gift.productName
        ? `Product: ${block.gift.productName}`
        : `Productblok ${index + 1}`
    case 'faq':
      return `FAQ (${block.items.length} vragen)`
    case 'verdict':
      return block.title ? `Eindoordeel: ${block.title}` : `Eindoordeel`
    default:
      return block.label || `Blok ${index + 1}`
  }
}

const ensureRetailerCount = (retailers: RetailerDraft[]): RetailerDraft[] => {
  if (!retailers.length) {
    return [{ id: generateId(), name: '', affiliateLink: '' }]
  }
  return retailers
}

const ContentBuilder: React.FC<ContentBuilderProps> = ({ value, onChange }) => {
  const blocks = useMemo(() => value, [value])

  const updateBlock = (id: string, updater: (block: ContentBlockDraft) => ContentBlockDraft) => {
    onChange(blocks.map((block) => (block.id === id ? updater(block) : block)))
  }

  const removeBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id))
  }

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex((block) => block.id === id)
    if (index === -1) return
    const block = blocks[index]
    const cloned = JSON.parse(JSON.stringify(block)) as ContentBlockDraft
    cloned.id = generateId()

    if (cloned.type === 'gift') {
      cloned.gift.retailers = cloned.gift.retailers.map((retailer) => ({
        ...retailer,
        id: generateId(),
      }))
    }
    if (cloned.type === 'faq') {
      cloned.items = cloned.items.map((item) => ({ ...item, id: generateId() }))
    }

    const next = [...blocks]
    next.splice(index + 1, 0, cloned)
    onChange(next)
  }

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = blocks.findIndex((block) => block.id === id)
    if (index === -1) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= blocks.length) return

    const next = [...blocks]
    const [removed] = next.splice(index, 1)
    next.splice(targetIndex, 0, removed)
    onChange(next)
  }

  const addBlock = (type: ContentBlockDraft['type']) => {
    const next = [...blocks, createEmptyDraft(type)]
    onChange(next)
  }

  const applyTemplate = (templateId: string) => {
    const template = CONTENT_TEMPLATES.find((option) => option.id === templateId)
    if (!template) {
      return
    }
    const templateBlocks = template.build()
    if (!templateBlocks.length) {
      return
    }
    const hasOnlyEmptyParagraph =
      blocks.length === 1 &&
      blocks[0].type === 'paragraph' &&
      !(blocks[0] as ParagraphBlockDraft).text.trim()
    const base = hasOnlyEmptyParagraph ? [] : blocks
    onChange([...base, ...templateBlocks])
  }

  const renderParagraphForm = (block: ParagraphBlockDraft) => (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <textarea
          value={block.text}
          onChange={(event) =>
            updateBlock(block.id, (current) => ({
              ...(current as ParagraphBlockDraft),
              text: event.target.value,
            }))
          }
          rows={block.style === 'paragraph' ? 4 : 6}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
          placeholder={
            block.style === 'paragraph'
              ? 'Schrijf hier je paragraaf. Gebruik een nieuwe regel voor een zachte overgang.'
              : block.style === 'bullets'
                ? 'Elke regel wordt een bullet point.'
                : block.style === 'numbered'
                  ? 'Elke regel wordt een genummerd item.'
                  : block.style === 'quote'
                    ? 'Deze tekst wordt als quote / highlight weergegeven.'
                    : 'Plak of schrijf hier HTML voor gevorderde opmaak.'
          }
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Weergavestijl</label>
          <select
            value={block.style}
            onChange={(event) =>
              updateBlock(block.id, (current) => ({
                ...(current as ParagraphBlockDraft),
                style: event.target.value as ParagraphStyle,
              }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
          >
            {styleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Kies hoe dit blok moet tonen. Bullet/nummer lijsten maken automatisch nette opsommingen.
          </p>
        </div>
      </div>
    </div>
  )

  const renderHeadingForm = (block: HeadingBlockDraft) => (
    <input
      type="text"
      value={block.text}
      onChange={(event) =>
        updateBlock(block.id, (current) => ({
          ...(current as HeadingBlockDraft),
          text: event.target.value,
        }))
      }
      placeholder="Bijv. Wat maakt dit cadeau speciaal?"
      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
    />
  )

  const renderImageForm = (block: ImageBlockDraft) => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="md:w-64">
          <ImageUpload
            currentImage={block.src}
            onImageUpload={(url) =>
              updateBlock(block.id, (current) => ({
                ...(current as ImageBlockDraft),
                src: url,
              }))
            }
            onImageDelete={() =>
              updateBlock(block.id, (current) => ({
                ...(current as ImageBlockDraft),
                src: '',
              }))
            }
            folder="blog-inline"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Afbeelding URL</label>
            <input
              type="text"
              value={block.src}
              onChange={(event) =>
                updateBlock(block.id, (current) => ({
                  ...(current as ImageBlockDraft),
                  src: event.target.value,
                }))
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alt-tekst</label>
              <input
                type="text"
                value={block.alt}
                onChange={(event) =>
                  updateBlock(block.id, (current) => ({
                    ...(current as ImageBlockDraft),
                    alt: event.target.value,
                  }))
                }
                placeholder="Korte beschrijving voor SEO & toegankelijkheid"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Caption (optioneel)</label>
              <input
                type="text"
                value={block.caption}
                onChange={(event) =>
                  updateBlock(block.id, (current) => ({
                    ...(current as ImageBlockDraft),
                    caption: event.target.value,
                  }))
                }
                placeholder="Laat optioneel een onderschrift zien"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Affiliate link (optioneel)
            </label>
            <input
              type="text"
              value={block.href}
              onChange={(event) =>
                updateBlock(block.id, (current) => ({
                  ...(current as ImageBlockDraft),
                  href: event.target.value,
                }))
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Als je een link invult wordt de afbeelding klikbaar gemaakt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGiftForm = (block: GiftBlockDraft) => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Productnaam</label>
          <input
            type="text"
            value={block.gift.productName}
            onChange={(event) =>
              updateBlock(block.id, (current) => ({
                ...(current as GiftBlockDraft),
                gift: {
                  ...(current as GiftBlockDraft).gift,
                  productName: event.target.value,
                },
              }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
            placeholder="Bijv. Double A Premium 500 Vel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Prijsrange</label>
          <input
            type="text"
            value={block.gift.priceRange}
            onChange={(event) =>
              updateBlock(block.id, (current) => ({
                ...(current as GiftBlockDraft),
                gift: {
                  ...(current as GiftBlockDraft).gift,
                  priceRange: event.target.value,
                },
              }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
            placeholder="Bijv. €19 - €24"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Korte beschrijving</label>
        <textarea
          value={block.gift.description}
          onChange={(event) =>
            updateBlock(block.id, (current) => ({
              ...(current as GiftBlockDraft),
              gift: {
                ...(current as GiftBlockDraft).gift,
                description: event.target.value,
              },
            }))
          }
          rows={4}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
          placeholder="Waarom is dit een goed cadeau?"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <ImageUpload
            currentImage={block.gift.imageUrl}
            onImageUpload={(url) =>
              updateBlock(block.id, (current) => ({
                ...(current as GiftBlockDraft),
                gift: {
                  ...(current as GiftBlockDraft).gift,
                  imageUrl: url,
                },
              }))
            }
            onImageDelete={() =>
              updateBlock(block.id, (current) => ({
                ...(current as GiftBlockDraft),
                gift: {
                  ...(current as GiftBlockDraft).gift,
                  imageUrl: '',
                },
              }))
            }
            folder="blog-products"
          />
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Affiliate retailers</label>
          {ensureRetailerCount(block.gift.retailers).map((retailer, index) => (
            <div key={retailer.id} className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={retailer.name}
                onChange={(event) =>
                  updateBlock(block.id, (current) => {
                    const draft = current as GiftBlockDraft
                    const retailers = draft.gift.retailers.map((item) =>
                      item.id === retailer.id ? { ...item, name: event.target.value } : item
                    )
                    return {
                      ...draft,
                      gift: { ...draft.gift, retailers },
                    }
                  })
                }
                placeholder="Naam winkel, bijv. Coolblue"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={retailer.affiliateLink}
                  onChange={(event) =>
                    updateBlock(block.id, (current) => {
                      const draft = current as GiftBlockDraft
                      const retailers = draft.gift.retailers.map((item) =>
                        item.id === retailer.id
                          ? { ...item, affiliateLink: event.target.value }
                          : item
                      )
                      return {
                        ...draft,
                        gift: { ...draft.gift, retailers },
                      }
                    })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                />
                {block.gift.retailers.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateBlock(block.id, (current) => {
                        const draft = current as GiftBlockDraft
                        return {
                          ...draft,
                          gift: {
                            ...draft.gift,
                            retailers: draft.gift.retailers.filter(
                              (item) => item.id !== retailer.id
                            ),
                          },
                        }
                      })
                    }
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-2 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateBlock(block.id, (current) => {
                const draft = current as GiftBlockDraft
                return {
                  ...draft,
                  gift: {
                    ...draft.gift,
                    retailers: [
                      ...draft.gift.retailers,
                      { id: generateId(), name: '', affiliateLink: '' },
                    ].slice(0, 3),
                  },
                }
              })
            }
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            + Extra retailer toevoegen
          </button>
          <p className="text-xs text-gray-500">Voeg maximaal drie vertrouwde winkels toe.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Product tags</label>
        <input
          type="text"
          value={block.gift.tags}
          onChange={(event) =>
            updateBlock(block.id, (current) => ({
              ...(current as GiftBlockDraft),
              gift: {
                ...(current as GiftBlockDraft).gift,
                tags: event.target.value,
              },
            }))
          }
          placeholder="Kommagescheiden, bijv. kantoor,productiviteit"
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Gebruik tags om productcategorieën te markeren. Dit helpt bij interne zoekfilters.
        </p>
      </div>
    </div>
  )

  const renderFaqForm = (block: FAQBlockDraft) => (
    <div className="space-y-4">
      {block.items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Vraag {index + 1}</span>
            {block.items.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  updateBlock(block.id, (current) => ({
                    ...(current as FAQBlockDraft),
                    items: (current as FAQBlockDraft).items.filter((faq) => faq.id !== item.id),
                  }))
                }
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Verwijder vraag
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Vraag</label>
              <input
                type="text"
                value={item.question}
                onChange={(event) =>
                  updateBlock(block.id, (current) => ({
                    ...(current as FAQBlockDraft),
                    items: (current as FAQBlockDraft).items.map((faq) =>
                      faq.id === item.id ? { ...faq, question: event.target.value } : faq
                    ),
                  }))
                }
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                placeholder="Veelgestelde vraag..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Antwoord</label>
              <textarea
                value={item.answer}
                onChange={(event) =>
                  updateBlock(block.id, (current) => ({
                    ...(current as FAQBlockDraft),
                    items: (current as FAQBlockDraft).items.map((faq) =>
                      faq.id === item.id ? { ...faq, answer: event.target.value } : faq
                    ),
                  }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                placeholder="Helder en beknopt antwoord..."
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          updateBlock(block.id, (current) => ({
            ...(current as FAQBlockDraft),
            items: [
              ...(current as FAQBlockDraft).items,
              { id: generateId(), question: '', answer: '' },
            ],
          }))
        }
        className="text-sm font-medium text-rose-600 hover:text-rose-700"
      >
        + Nieuwe FAQ toevoegen
      </button>
    </div>
  )

  const renderVerdictForm = (block: VerdictBlockDraft) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titel</label>
        <input
          type="text"
          value={block.title}
          onChange={(event) =>
            updateBlock(block.id, (current) => ({
              ...(current as VerdictBlockDraft),
              title: event.target.value,
            }))
          }
          placeholder="Bijv. Betaalbaar, bruikbaar en persoonlijk"
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Toelichting</label>
        <textarea
          value={block.text}
          onChange={(event) =>
            updateBlock(block.id, (current) => ({
              ...(current as VerdictBlockDraft),
              text: event.target.value,
            }))
          }
          rows={4}
          placeholder="Vat het oordeel samen in één krachtige alinea."
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>
  )

  const renderUnsupportedBlock = (block: UnsupportedBlockDraft) => (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      <p className="font-medium text-gray-700">{block.label || 'Niet-bewerkbaar blok'}</p>
      <p className="text-xs text-gray-500 mt-1">
        Dit bloktype wordt nog niet ondersteund in de visuele editor. Je kunt het laten staan of
        verwijderen.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div key={block.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-2xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">{labelForBlock(block, index)}</p>
              <p className="text-xs text-gray-500">Blok #{index + 1}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {block.type !== 'unsupported' && (
                <select
                  value={block.type}
                  onChange={(event) => {
                    const nextType = event.target.value as ContentBlockDraft['type']
                    updateBlock(block.id, () => ({ ...createEmptyDraft(nextType), id: block.id }))
                  }}
                  className="rounded-lg border border-gray-300 p-2 text-xs font-medium text-gray-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                >
                  {blockTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, -1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40"
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40"
                  disabled={index === blocks.length - 1}
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => duplicateBlock(block.id)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:border-rose-200 hover:text-rose-600"
              >
                Dupliceer
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Verwijder
              </button>
            </div>
          </div>
          <div className="p-5">
            {block.type === 'paragraph' && renderParagraphForm(block)}
            {block.type === 'heading' && renderHeadingForm(block)}
            {block.type === 'image' && renderImageForm(block)}
            {block.type === 'gift' && renderGiftForm(block)}
            {block.type === 'faq' && renderFaqForm(block)}
            {block.type === 'verdict' && renderVerdictForm(block)}
            {block.type === 'unsupported' && renderUnsupportedBlock(block)}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-6 text-center">
        <p className="text-sm font-semibold text-gray-700 mb-4">Voeg een nieuw contentblok toe</p>
        <div className="flex flex-wrap justify-center gap-3">
          {blockTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => addBlock(option.value)}
              className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-500 hover:text-white transition-colors"
            >
              + {option.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Elke sectie heeft een eigen formulier. Vul alles in en de editor bouwt automatisch een
          perfecte blogpost.
        </p>
        {CONTENT_TEMPLATES.length > 0 && (
          <div className="mt-5 rounded-xl border border-rose-100 bg-white p-4 text-left">
            <p className="text-sm font-semibold text-gray-700">Snelle templates</p>
            <p className="mt-1 text-xs text-gray-500">
              Kies een voorgebouwde structuur en vul hem meteen met jouw content.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {CONTENT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className="flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-rose-300 hover:bg-white"
                >
                  <span className="text-sm font-semibold text-gray-800">{template.label}</span>
                  <span className="mt-1 text-xs text-gray-500">{template.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { generateId, createEmptyDraft }
export default ContentBuilder
