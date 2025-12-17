import { useEffect } from 'react'
import { withAffiliate } from '../../services/affiliate'
import { pushToDataLayer } from '../../services/dataLayerService'

interface Product {
  id: string
  name: string
  tagline: string
  price: string
  originalPrice?: string
  imageUrl: string
  amazonUrl: string
  badge?: string
  forWho: string
  whyGreat: string[]
}

const CAMPAIGN_PRODUCTS: Product[] = [
  {
    id: 'chipolo-tracker',
    name: 'Chipolo ONE Spot',
    tagline: 'Nooit meer je sleutels kwijt',
    price: '€18,00',
    imageUrl: 'https://m.media-amazon.com/images/I/712y0Outc3L._AC_SL1500_.jpg',
    amazonUrl:
      'https://www.amazon.nl/Chipolo-ONE-Spot-Sleutelvinder-Bluetooth/dp/B09C89S7WG?tag=gifteez77-21&linkCode=ll1&linkId=aa1e7d28ec47784726d50a1720cd19a3&language=nl_NL&ref_=as_li_ss_tl',
    badge: '🔥 Populair',
    forWho: 'Voor hem (tech lovers & vergeetachtige mensen)',
    whyGreat: [
      'Werkt met Apple Zoek Mijn-netwerk',
      'Waterbestendig & batterij gaat 1 jaar mee',
      'Extra luid geluid (120dB)',
      'Perfect voor sleutels, tas, portemonnee',
    ],
  },
  {
    id: 'led-reading-light',
    name: 'Gritin LED Leeslamp',
    tagline: 'Lezen zonder je partner te storen',
    price: '€11,95',
    originalPrice: '€15,99',
    imageUrl: 'https://m.media-amazon.com/images/I/81n7M-T19NL._AC_SL1500_.jpg',
    amazonUrl:
      'https://www.amazon.nl/Gritin-Eye-Protecting-Flexibele-Oplaadbaar-Batterijlevensduur/dp/B08GG42WXY?tag=gifteez77-21&linkCode=ll1&linkId=cd6e9041ceb3565c18acf17617214f90&language=nl_NL&ref_=as_li_ss_tl',
    badge: '💰 Budget Pick',
    forWho: 'Voor lezers, studenten & nachtbrakers',
    whyGreat: [
      'Oplaadbaar via USB (geen batterijen nodig)',
      '3 helderheidsstanden + warm licht',
      'Flexibele hals - clip overal op',
      'Beschermt je ogen tijdens lezen',
    ],
  },
  {
    id: 'aroma-diffuser',
    name: 'Aromadiffuser',
    tagline: 'Instant zen in huis',
    price: '€20,96',
    imageUrl: 'https://m.media-amazon.com/images/I/61VWW+Eo2kL._AC_SL1500_.jpg',
    amazonUrl:
      'https://www.amazon.nl/Aromadiffuser-etherische-aromatherapie-diffuser-automatische-uitschakelfunctie/dp/B0DFGY2535?tag=gifteez77-21&linkCode=ll1&linkId=4fbcce986136a038a767f2cbd50e81ae&language=nl_NL&ref_=as_li_ss_tl',
    badge: '✨ Self-care',
    forWho: 'Voor haar (wellness fans & rust zoekers)',
    whyGreat: [
      'Werkt 6-8 uur continu',
      'Inclusief 7-kleuren LED sfeerverlichting',
      'Fluisterstil - perfect voor slaapkamer',
      'Automatische uitschakeling bij leeg',
    ],
  },
]

const Top3CampaignPage = () => {
  useEffect(() => {
    // Set page title
    document.title = '3 Cadeaus die Altijd Goed Vallen - Gifteez.nl'

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Ontdek 3 slimme cadeaus onder €25 die gegarandeerd in de smaak vallen. Van tech gadgets tot wellness - perfect voor elke gelegenheid.'
      )
    }

    // Track page view
    pushToDataLayer({
      event: 'page_view',
      page_title: 'Top 3 Cadeaus - 7 Dagen Campagne',
      page_location: window.location.href,
      campaign: '7day-nov2025',
    })

    // Scroll to top
    window.scrollTo(0, 0)
  }, [])

  const handleProductClick = (product: Product) => {
    // Track affiliate click
    pushToDataLayer({
      event: 'select_promotion',
      promotion_name: '7day-campaign-top3',
      creative_name: product.name,
      creative_slot: product.id,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: parseFloat(product.price.replace('€', '').replace(',', '.')),
        },
      ],
    })

    pushToDataLayer({
      event: 'click_affiliate',
      link_url: product.amazonUrl,
      link_text: product.name,
      retailer: 'amazon',
      campaign: '7day-nov2025',
      placement: 'top3-landing',
    })

    // Add UTM parameters for campaign tracking
    const urlWithTracking = withAffiliate(product.amazonUrl, {
      pageType: 'campaign',
      theme: '7day-top3',
      placement: 'product-card',
      retailer: 'amazon',
    })

    // Open in new tab
    window.open(urlWithTracking, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            3 Cadeaus die <span className="text-yellow-300">Altijd</span> Goed Vallen 🎁
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-purple-100">
            Op zoek naar een cadeau dat niet te duur is, maar wél indruk maakt?
          </p>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto">
            Deze drie Amazon-vondsten scoren altijd goed. Van tech lovers tot wellness fans —
            iedereen vindt hier wat leuks.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            <span className="text-yellow-300">⚡</span>
            <span>Allemaal onder €25 • Direct leverbaar</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CAMPAIGN_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Badge */}
              {product.badge && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold py-2 px-4 text-center">
                  {product.badge}
                </div>
              )}

              {/* Image */}
              <div className="relative overflow-hidden bg-gray-50 h-64">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4 italic">{product.tagline}</p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-purple-600">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                {/* For Who */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg min-h-[60px] flex items-center">
                  <p className="text-sm font-semibold text-blue-900">{product.forWho}</p>
                </div>

                {/* Why Great */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Waarom geweldig:</p>
                  <ul className="space-y-1">
                    {product.whyGreat.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleProductClick(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🛒 Bekijk op Amazon
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">Opent in nieuw tabblad</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why These Picks Section */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Waarom deze 3 cadeaus?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3" role="img" aria-hidden="true">
                💰
              </div>
              <h3 className="font-bold text-lg mb-2">Budget-friendly</h3>
              <p className="text-gray-600 text-sm">
                Alle drie onder €25 — klein budget, grote impact
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3" role="img" aria-hidden="true">
                🎯
              </div>
              <h3 className="font-bold text-lg mb-2">Universeel leuk</h3>
              <p className="text-gray-600 text-sm">
                Voor hem, voor haar, voor collega's — altijd raak
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3" role="img" aria-hidden="true">
                ⚡
              </div>
              <h3 className="font-bold text-lg mb-2">Direct leverbaar</h3>
              <p className="text-gray-600 text-sm">Via Amazon Prime vaak morgen al in huis</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Meer cadeau-inspiratie nodig?</h2>
          <p className="text-xl mb-6 text-purple-100">
            Ontdek honderden geteste cadeaus op Gifteez.nl
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-purple-50 transition-all shadow-lg"
            >
              🏠 Naar Homepage
            </a>
            <a
              href="/deals"
              className="inline-flex items-center justify-center gap-2 bg-purple-500/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl hover:bg-purple-500/40 transition-all border-2 border-white/30"
            >
              🔥 Bekijk Deals
            </a>
          </div>
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            <strong>Affiliate disclosure:</strong> Deze pagina bevat affiliate links naar Amazon.nl.
            Als je via onze links een product koopt, verdienen wij een kleine commissie zonder extra
            kosten voor jou. Zo kunnen we Gifteez.nl blijven verbeteren. Wij raden alleen producten
            aan die we zelf goed vinden! 💜
          </p>
        </div>
      </div>
    </div>
  )
}

export default Top3CampaignPage
