#!/usr/bin/env npx tsx
/**
 * Pinterest Pin Generator voor Gifteez Cadeaugidsen
 *
 * Dit script genereert pin-ready content voor elke programmatic landing page.
 * Output: JSON met 10-20 pin variaties per gids, klaar voor Pinterest scheduling tools.
 *
 * Gebruik:
 *   npx tsx scripts/generate-pinterest-pins.ts
 *   npx tsx scripts/generate-pinterest-pins.ts --slug=cadeaus-voor-thuiswerkers
 *
 * Output:
 *   public/pinterest/pins-index.json (alle gidsen)
 *   public/pinterest/[slug].json (individuele gids)
 */

import fs from 'fs'
import path from 'path'

// Type definitions
interface PinVariation {
  id: string
  title: string
  description: string
  link: string
  board: string
  style: 'product' | 'lifestyle' | 'list' | 'question' | 'benefit'
  hashtags: string[]
  imagePrompt: string // For AI image generation (Canva/Midjourney)
  cta: string
}

interface GuideConfig {
  slug: string
  title: string
  intro: string
  curatedProducts?: Array<{
    title: string
    price: number
    reason: string
  }>
  quickScan?: {
    personas?: Array<{
      label: string
      summary: string
    }>
  }
  faq?: Array<{
    q: string
    a: string
  }>
}

interface PinterestExport {
  generatedAt: string
  totalPins: number
  guides: Array<{
    slug: string
    title: string
    url: string
    pinCount: number
    pins: PinVariation[]
  }>
}

// Pin templates per style
const PIN_TEMPLATES = {
  product: [
    '🎁 {productName} - Het perfecte cadeau voor {audience}',
    '✨ Cadeau tip: {productName} ({price})',
    'Top pick voor {audience}: {productName}',
  ],
  lifestyle: [
    '{audience} verdienen beter - ontdek de beste cadeaus',
    'Maak {audience} blij met deze slimme cadeaus',
    'De ultieme cadeaugids voor {audience}',
  ],
  list: [
    '{count} slimme cadeaus voor {audience} (2025)',
    'De beste cadeaus voor {audience} - Complete gids',
    'Top {count} cadeaus voor {audience} onder €{budget}',
  ],
  question: [
    'Weet je niet wat je moet kopen voor {audience}? 🤔',
    'Op zoek naar het perfecte cadeau voor {audience}?',
    'Wat geef je iemand die {interest}?',
  ],
  benefit: [
    'Dit cadeau maakt {audience} écht blij',
    'Waarom {productName} het beste cadeau is voor {audience}',
    '{benefit} - De perfecte cadeautip',
  ],
}

// Hashtag sets per categorie
const HASHTAG_SETS = {
  thuiswerkers: [
    '#thuiswerken',
    '#homeoffice',
    '#werkplek',
    '#ergonomisch',
    '#productiviteit',
    '#cadeautip',
    '#cadeaus',
    '#gifteez',
  ],
  tech: [
    '#techcadeaus',
    '#gadgets',
    '#techgifts',
    '#slimwonen',
    '#cadeautip',
    '#cadeaus',
    '#gifteez',
  ],
  nachtlezers: [
    '#boeken',
    '#lezen',
    '#leeslamp',
    '#boekenliefhebber',
    '#cadeautip',
    '#cadeaus',
    '#gifteez',
  ],
  default: ['#cadeautip', '#cadeaus', '#cadeau', '#gifting', '#gifteez', '#Nederland'],
}

// Board mapping
const BOARD_MAPPING: Record<string, string> = {
  'cadeaus-voor-thuiswerkers': 'Thuiswerken Cadeaus',
  'cadeaus-voor-nachtlezers': 'Boeken & Lezen Cadeaus',
  'kerst-tech-onder-100': 'Tech Cadeaus',
  'gamer-cadeaus-onder-100': 'Gaming Cadeaus',
  default: 'Cadeautips',
}

function getHashtags(slug: string): string[] {
  if (slug.includes('thuiswerk')) return HASHTAG_SETS.thuiswerkers
  if (slug.includes('tech') || slug.includes('gamer')) return HASHTAG_SETS.tech
  if (slug.includes('lezer') || slug.includes('boek')) return HASHTAG_SETS.nachtlezers
  return HASHTAG_SETS.default
}

function getBoard(slug: string): string {
  return BOARD_MAPPING[slug] || BOARD_MAPPING.default
}

function extractAudience(title: string): string {
  // Extract audience from title like "De beste cadeaus voor thuiswerkers"
  const match = title.match(/voor\s+(.+?)(?:\s+\(|\s*$)/i)
  return match ? match[1] : 'je dierbaren'
}

function generatePins(guide: GuideConfig): PinVariation[] {
  const pins: PinVariation[] = []
  const audience = extractAudience(guide.title)
  const hashtags = getHashtags(guide.slug)
  const board = getBoard(guide.slug)
  const baseUrl = `https://gifteez.nl/cadeaugidsen/${guide.slug}`

  // 1. Main list pins (3 variaties)
  const productCount = guide.curatedProducts?.length || 15
  PIN_TEMPLATES.list.forEach((template, i) => {
    pins.push({
      id: `${guide.slug}-list-${i + 1}`,
      title: template
        .replace('{count}', String(productCount))
        .replace('{audience}', audience)
        .replace('{budget}', '100'),
      description: `${guide.intro.slice(0, 200)}... Bekijk de complete gids op Gifteez.nl`,
      link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}`,
      board,
      style: 'list',
      hashtags,
      imagePrompt: `Clean, modern Pinterest pin design. Title: "${productCount} Cadeaus voor ${audience}". Style: minimalist, warm colors, gift boxes aesthetic. 2:3 ratio.`,
      cta: 'Bekijk alle cadeaus →',
    })
  })

  // 2. Product pins (top 5 producten)
  const topProducts = guide.curatedProducts?.slice(0, 5) || []
  topProducts.forEach((product, i) => {
    const template = PIN_TEMPLATES.product[i % PIN_TEMPLATES.product.length]
    pins.push({
      id: `${guide.slug}-product-${i + 1}`,
      title: template
        .replace('{productName}', product.title.split(' ').slice(0, 4).join(' '))
        .replace('{audience}', audience)
        .replace('{price}', `€${product.price.toFixed(2)}`),
      description: `${product.reason} | Bekijk meer cadeaus voor ${audience} op Gifteez.nl`,
      link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}&product=${i + 1}`,
      board,
      style: 'product',
      hashtags: [...hashtags.slice(0, 5), `#${product.title.split(' ')[0].toLowerCase()}`],
      imagePrompt: `Product photography style. ${product.title} on clean background. Lifestyle setting. Pinterest aesthetic. 2:3 ratio.`,
      cta: `Bekijk voor €${product.price.toFixed(2)}`,
    })
  })

  // 3. Question pins (2 variaties)
  PIN_TEMPLATES.question.forEach((template, i) => {
    if (i < 2) {
      pins.push({
        id: `${guide.slug}-question-${i + 1}`,
        title: template.replace('{audience}', audience).replace('{interest}', audience),
        description: `Ontdek ${productCount}+ slimme cadeautips die ${audience} écht blij maken. Van budget tot premium.`,
        link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}`,
        board,
        style: 'question',
        hashtags,
        imagePrompt: `Question mark with gift boxes. Warm, inviting colors. Text overlay: "Wat geef je ${audience}?" Pinterest style. 2:3 ratio.`,
        cta: 'Ontdek de antwoorden →',
      })
    }
  })

  // 4. Persona pins (als beschikbaar)
  guide.quickScan?.personas?.forEach((persona, i) => {
    pins.push({
      id: `${guide.slug}-persona-${i + 1}`,
      title: `Cadeaus voor ${persona.label}`,
      description: `${persona.summary} | Bekijk alle aanbevelingen op Gifteez.nl`,
      link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}&persona=${persona.label.toLowerCase().replace(/\s/g, '-')}`,
      board,
      style: 'lifestyle',
      hashtags,
      imagePrompt: `Lifestyle scene representing "${persona.label}". Warm, authentic feeling. Gift elements. Pinterest aesthetic. 2:3 ratio.`,
      cta: 'Bekijk de cadeautips →',
    })
  })

  // 5. FAQ pins (top 2)
  guide.faq?.slice(0, 2).forEach((faq, i) => {
    pins.push({
      id: `${guide.slug}-faq-${i + 1}`,
      title: faq.q,
      description: `${faq.a.slice(0, 200)}... Meer tips op Gifteez.nl`,
      link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}#faq`,
      board,
      style: 'question',
      hashtags,
      imagePrompt: `FAQ style pin. Question: "${faq.q}". Clean design with answer preview. Pinterest aesthetic. 2:3 ratio.`,
      cta: 'Lees het antwoord →',
    })
  })

  // 6. Benefit pin
  pins.push({
    id: `${guide.slug}-benefit-1`,
    title: `Maak ${audience} écht blij met deze cadeaus`,
    description: `Van onze experts: de slimste cadeaus voor ${audience}. Praktisch, doordacht en persoonlijk. Bekijk de complete gids.`,
    link: `${baseUrl}?utm_source=pinterest&utm_medium=pin&utm_campaign=${guide.slug}`,
    board,
    style: 'benefit',
    hashtags,
    imagePrompt: `Happy person receiving gift. Warm, emotional feeling. ${audience} aesthetic. Pinterest style. 2:3 ratio.`,
    cta: 'Bekijk de gids →',
  })

  return pins
}

async function main() {
  console.log('🎯 Pinterest Pin Generator voor Gifteez\n')

  // Parse arguments
  const args = process.argv.slice(2)
  const slugArg = args.find((a) => a.startsWith('--slug='))
  const targetSlug = slugArg?.split('=')[1]

  // Load programmatic configs
  const configPath = path.join(process.cwd(), 'data', 'programmatic', 'index.ts')

  if (!fs.existsSync(configPath)) {
    console.error('❌ Kan programmatic config niet vinden:', configPath)
    process.exit(1)
  }

  // Read the raw TypeScript file and extract configs
  const configContent = fs.readFileSync(configPath, 'utf-8')

  // Extract slug list from the file
  const slugMatches = configContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)
  const slugs = [...slugMatches].map((m) => m[1]).filter((s) => !s.includes('test'))

  console.log(`📚 Gevonden gidsen: ${slugs.length}\n`)

  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'pinterest')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const allGuides: PinterestExport['guides'] = []

  for (const slug of slugs) {
    if (targetSlug && slug !== targetSlug) continue

    // Extract config for this slug (simplified extraction)
    const _configMatch = configContent.match(
      new RegExp(`{[^}]*slug:\\s*['"]${slug}['"][^}]*}`, 's')
    )

    // Create a minimal guide config based on slug patterns
    const guide: GuideConfig = {
      slug,
      title: `De beste cadeaus voor ${slug.replace(/-/g, ' ').replace('cadeaus voor ', '')}`,
      intro: 'Ontdek de beste cadeaus in deze categorie.',
      curatedProducts: Array(15)
        .fill(null)
        .map((_, i) => ({
          title: `Product ${i + 1}`,
          price: 20 + i * 5,
          reason: 'Populaire keuze',
        })),
      quickScan: {
        personas: [
          { label: 'Budget Shopper', summary: 'Zoekt waarde voor geld' },
          { label: 'Premium Koper', summary: 'Wil het beste van het beste' },
        ],
      },
      faq: [{ q: 'Wat is het beste cadeau?', a: 'Dat hangt af van je budget en voorkeuren.' }],
    }

    // Special handling for known slugs
    if (slug === 'cadeaus-voor-thuiswerkers') {
      guide.title = 'De beste cadeaus voor thuiswerkers (2025)'
      guide.intro =
        'Van ergonomische gadgets tot gezellige sfeermakers: ontdek de slimste cadeaus die elke thuiswerker blij maken.'
      guide.curatedProducts = [
        { title: 'Logitech MX Master 3S Muis', price: 89.99, reason: 'Beste ergonomische muis' },
        { title: 'BenQ ScreenBar Monitor Lamp', price: 99.0, reason: 'Geen reflectie op scherm' },
        { title: 'Fellowes Polssteun', price: 24.95, reason: 'Memory foam voor dagelijks comfort' },
        { title: 'Ember Mok 2', price: 99.95, reason: 'Houdt koffie op perfecte temperatuur' },
        { title: 'Bose QuietComfort Earbuds', price: 79.0, reason: 'Beste noise-cancelling' },
      ]
      guide.quickScan = {
        personas: [
          { label: 'De Productiviteit-Freak', summary: 'Wil alles optimaliseren' },
          { label: 'De Comfort-Zoeker', summary: 'Ergonomie is alles' },
          { label: 'De Sfeer-Creator', summary: 'Mooie werkplek = betere focus' },
        ],
      }
    }

    if (slug === 'cadeaus-voor-nachtlezers') {
      guide.title = 'De beste cadeaus voor nachtlezers (2025)'
      guide.intro = 'Amberkleurige lampjes en zachte klemmen voor urenlang leesplezier.'
      guide.curatedProducts = [
        { title: 'Gritin LED Leeslamp', price: 11.95, reason: 'Budget optie' },
        { title: 'Glocusent Halslamp', price: 14.99, reason: 'Handenvrij lezen' },
        { title: 'Gritin 3-Temp Premium', price: 19.99, reason: 'Amber modus' },
      ]
    }

    const pins = generatePins(guide)

    allGuides.push({
      slug,
      title: guide.title,
      url: `https://gifteez.nl/cadeaugidsen/${slug}`,
      pinCount: pins.length,
      pins,
    })

    // Write individual guide file
    const guideOutput = {
      generatedAt: new Date().toISOString(),
      guide: {
        slug,
        title: guide.title,
        url: `https://gifteez.nl/cadeaugidsen/${slug}`,
      },
      pinCount: pins.length,
      pins,
    }

    fs.writeFileSync(path.join(outputDir, `${slug}.json`), JSON.stringify(guideOutput, null, 2))

    console.log(`✅ ${slug}: ${pins.length} pins gegenereerd`)
  }

  // Write master index
  const masterOutput: PinterestExport = {
    generatedAt: new Date().toISOString(),
    totalPins: allGuides.reduce((sum, g) => sum + g.pinCount, 0),
    guides: allGuides,
  }

  fs.writeFileSync(path.join(outputDir, 'pins-index.json'), JSON.stringify(masterOutput, null, 2))

  console.log(`\n📊 Totaal: ${masterOutput.totalPins} pins voor ${allGuides.length} gidsen`)
  console.log(`📁 Output: public/pinterest/`)
  console.log('\n🎨 Volgende stappen:')
  console.log('   1. Gebruik imagePrompt velden voor Canva/Midjourney designs')
  console.log('   2. Upload naar Pinterest met Tailwind of Later')
  console.log('   3. Schedule pins over meerdere weken')
}

main().catch(console.error)
