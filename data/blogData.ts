
import { BlogPost, Gift } from '../types';

// Gift Definitions
const gift_duurzaam_1: Gift = {
  productName: "Herbruikbare Koffiebeker (HuskeeCup)",
  description: "Stijlvolle, duurzame beker gemaakt van koffieschillen. Perfect voor onderweg en helpt de afvalberg te verminderen.",
  priceRange: "€15 - €25",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=huskeecup&tag=gifteez77-21' }],
  imageUrl: "https://picsum.photos/seed/reusable-coffee-cup/300/300"
};

const gift_duurzaam_2: Gift = {
  productName: "The Good Roll - Vrolijk toiletpapier",
  description: "100% gerecycled en superzacht toiletpapier. Met de winst bouwen ze toiletten in ontwikkelingslanden. Een cadeau met impact!",
  priceRange: "€20 - €30",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=the+good+roll&tag=gifteez77-21' }],
  imageUrl: "https://picsum.photos/seed/eco-toilet-paper/300/300"
};

// Extra duurzame cadeaus (nieuw uitgebreide gids)
const gift_duurzaam_3: Gift = {
  productName: 'Zero Waste Starterkit',
  description: 'Set met bijenwasdoeken, bamboe bestek, herbruikbare zakjes en rvs rietjes om bewuster te beginnen.',
  priceRange: '€25 - €45',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=zero+waste+starterkit&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/zero-waste-kit/300/300'
};

const gift_duurzaam_4: Gift = {
  productName: 'Slimme Stekker (Energie Monitoring)',
  description: 'Meet en vermindert sluipverbruik. Direct inzicht in energie & kosten – duurzaam én leerzaam.',
  priceRange: '€15 - €35',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=slimme+stekker+energy+monitoring&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/smart-plug-energy/300/300'
};

const gift_duurzaam_5: Gift = {
  productName: 'Refurbished Smartphone (Mid-Range)',
  description: 'Circulair cadeau met verlengde levensduur. Vaak met garantie & lagere footprint dan nieuw.',
  priceRange: '€180 - €350',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=refurbished+smartphone&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/refurbished-phone/300/300'
};

const gift_duurzaam_6: Gift = {
  productName: 'Bijenhotel voor in de Tuin/Balkon',
  description: 'Stimuleert biodiversiteit en helpt solitaire bijen nestelen – educatief & eco-friendly.',
  priceRange: '€15 - €30',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=bijenhotel&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/bee-hotel/300/300'
};

const gift_duurzaam_7: Gift = {
  productName: 'RVS Herbruikbare Waterfles',
  description: 'Duurzame thermofles houdt dranken warm of koud en vervangt tientallen plastic flesjes.',
  priceRange: '€20 - €40',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=rvs+waterfles+isolatie&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/reusable-bottle/300/300'
};

const gift_duurzaam_8: Gift = {
  productName: 'Fairtrade Chocolade Proeverij',
  description: 'Pure & fairtrade chocolade set met verschillende oorsprongen – smaak + verhaal in één.',
  priceRange: '€15 - €35',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=fairtrade+chocolade+cadeau&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/fair-chocolate/300/300'
};

const gift_man_1: Gift = {
    productName: "LEGO Technic Racewagen",
    description: "Een uitdagende en gedetailleerde bouwset voor de man die van techniek en auto's houdt. Urenlang bouwplezier gegarandeerd.",
    priceRange: "€40 - €180",
    retailers: [
        { name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=LEGO+Technic+auto" },
        { name: "Amazon.nl", affiliateLink: "https://www.amazon.nl/s?k=LEGO+Technic+auto" },
    ],
  imageUrl: "https://picsum.photos/seed/lego-technic-car/300/300"
};

const gift_man_2: Gift = {
    productName: "Luxe Scheerset",
    description: "Een complete set met een klassiek scheermes, kwast en verzorgende producten voor een authentieke scheerervaring.",
    priceRange: "€50 - €100",
    retailers: [
        { name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=luxe+scheerset+man" },
    ],
  imageUrl: "https://picsum.photos/seed/shaving-kit-classy/300/300"
};

const gift_kerst_1: Gift = {
    productName: "Rituals Verwenpakket",
    description: "Een luxe giftset met heerlijk geurende producten voor een ontspannen moment. Een klassieker die altijd goed is.",
    priceRange: "€25 - €75",
    retailers: [{ name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=Rituals+giftset" }],
  imageUrl: "https://picsum.photos/seed/cosmetics-gift-set/300/300"
};

const gift_kerst_2: Gift = {
    productName: "Sonos Roam SL Speaker",
    description: "Een compacte, draagbare en krachtige speaker voor thuis en onderweg. Waterdicht en met een indrukwekkend geluid.",
    priceRange: "€150 - €200",
    retailers: [{ name: "Coolblue", affiliateLink: "https://www.coolblue.nl/product/885783/sonos-roam-sl-wit.html" }],
  imageUrl: "https://picsum.photos/seed/portable-speaker/300/300"
};

const gift_earbuds_1: Gift = {
    productName: "Anker Soundcore Life P3",
    description: "Indrukwekkende noise cancelling, draadloos opladen en een aanpasbaar geluid via de app. Enorme waarde voor je geld.",
    priceRange: "€70 - €90",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=Anker+Soundcore+Life+P3&tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/512Jwa3KmkL._AC_SX522_.jpg"
};

const gift_earbuds_2: Gift = {
    productName: "JBL Tune 230NC TWS",
    description: "De kenmerkende diepe bas van JBL, actieve noise cancelling en een comfortabele pasvorm voor dagelijks gebruik.",
    priceRange: "€60 - €80",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=JBL+Tune+230NC&tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/51KEIAsdyfL._AC_SX679_.jpg"
};

const gift_earbuds_3: Gift = {
  productName: "Sony WF-C510",
  description: "Verbeterde opvolger met focus op helder geluid, draagcomfort en efficiënte batterij; compact & licht met DSEE voor audio-upscaling.",
  priceRange: "€50 - €80",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/dp/B0DBLN4C47?tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/419pART3qYL._AC_SX522_.jpg"
};

// Tech Lover Gifts (nieuw artikel)
const gift_tech_1: Gift = {
  productName: "Anker 3-in-1 Draadloze Oplader",
  description: "Laad telefoon, earbuds en smartwatch tegelijk op – strak bureau, minder kabels.",
  priceRange: "€35 - €55",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=anker+3+in+1+wireless+charger&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-wireless-charger/300/300'
};

const gift_tech_2: Gift = {
  productName: "Mechanisch Toetsenbord (Hot‑Swap)",
  description: "Responsief typen, personaliseerbare switches & RGB – perfect voor creators en gamers.",
  priceRange: "€70 - €140",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=hot+swappable+mechanisch+toetsenbord&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-mech-keyboard/300/300'
};

const gift_tech_3: Gift = {
  productName: "Noise Cancelling Koptelefoon Mid-Range",
  description: "Comfort + ruisonderdrukking voor thuiswerken, reizen en focus.",
  priceRange: "€120 - €220",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=noise+cancelling+koptelefoon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-anc-headphones/300/300'
};

const gift_tech_4: Gift = {
  productName: "Smart Home Starterkit (Bridge + Sensors)",
  description: "Begin met automatiseren: slimme verlichting, beweging & temperatuur voor comfort en energie‑besparing.",
  priceRange: "€60 - €120",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=smart+home+starterkit&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-smart-home/300/300'
};

const gift_tech_5: Gift = {
  productName: "Portable SSD (1TB USB‑C)",
  description: "Supersnelle opslag voor foto’s, video’s & projecten – zakformaat, shock resistant.",
  priceRange: "€70 - €130",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=portable+ssd+1tb+usb+c&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-portable-ssd/300/300'
};

const gift_tech_6: Gift = {
  productName: "E-reader met Warm Licht",
  description: "Lees overal zonder afleiding; aanpasbare kleurtemperatuur voor ogen in de avond.",
  priceRange: "€100 - €180",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=ereader+warm+licht&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-ereader/300/300'
};

const gift_tech_7: Gift = {
  productName: "VR Headset Instapklasse",
  description: "Immersieve games & experiences zonder dure PC – ideaal voor nieuwsgierige pioniers.",
  priceRange: "€250 - €450",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=vr+headset&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-vr/300/300'
};

const gift_tech_8: Gift = {
  productName: "Duurzame Solar Powerbank",
  description: "Laadt apparaten op via zon én USB – handig voor kamperen en noodgevallen.",
  priceRange: "€30 - €60",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=solar+powerbank&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-solar-power/300/300'
};

// Experience Gifts (alleen Amazon links)
const gift_exp_1: Gift = {
  productName: 'Avontuurlijke Smartbox (Bungeejump / Indoor Skydiving)',
  description: 'Adrenaline in een doosje: keuze uit meerdere activiteiten voor waaghalzen of bucket‑list starters.',
  priceRange: '€50 - €120',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=smartbox+avontuur&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-adventure/300/300'
};

const gift_exp_2: Gift = {
  productName: 'Wellness / Sauna Cadeaubon',
  description: 'Een dag volledige ontspanning: sauna, massages en rust. Perfect voor drukke levens.',
  priceRange: '€40 - €150',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=wellness+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-wellness/300/300'
};

const gift_exp_3: Gift = {
  productName: 'Kookworkshop / Culinaire Cadeaubon',
  description: 'Samen leren & proeven: van sushi of pasta maken tot barista of chocoladekunst.',
  priceRange: '€45 - €110',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=kookworkshop+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-cooking/300/300'
};

const gift_exp_4: Gift = {
  productName: 'Creatieve Workshop (Keramiek / Schilderen)',
  description: 'Actief & mindful bezig zijn en met een tastbaar eigen resultaat naar huis gaan.',
  priceRange: '€35 - €90',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=creatieve+workshop+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-creative/300/300'
};

const gift_exp_5: Gift = {
  productName: 'Escape Room Cadeaubon (Team Experience)',
  description: 'Samen puzzelen onder tijdsdruk – versterkt vriendschappen & zorgt voor verhalen achteraf.',
  priceRange: '€60 - €140',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=escape+room+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-escaperoom/300/300'
};

const gift_exp_6: Gift = {
  productName: 'Romantisch Diner Cadeaubon',
  description: 'Een avond culinair genieten – ideaal als gedeeld cadeau met beleving én herinnering.',
  priceRange: '€50 - €130',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=restaurant+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-dinner/300/300'
};

const gift_exp_7: Gift = {
  productName: 'Indoor Klim- of Boulder Intro',
  description: 'Fysieke uitdaging + mentale focus. Toegankelijk voor beginners en verslavend leuk.',
  priceRange: '€25 - €60',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=klim+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-climb/300/300'
};

const gift_exp_8: Gift = {
  productName: 'Fotografie Workshop / Instap Cursus',
  description: 'Verbeter direct compositie & storytelling – ook leuk in combinatie met bestaande camera.',
  priceRange: '€70 - €180',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=fotografie+workshop+cadeaubon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/experience-photo/300/300'
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'beste-ervaringscadeaus-2025',
    title: 'De Beste Ervaringscadeaus (2025): 35+ Belevingen die Blijvend Herinnerd Worden',
    excerpt: 'Geef een herinnering in plaats van een voorwerp. Van adrenaline en wellness tot culinair en creatief – deze ervaringscadeaus scoren écht.',
    imageUrl: '/images/trending-ervaringen.png',
    category: 'Ervaringen',
    author: { name: 'Gifteez Redactie', avatarUrl: 'https://i.pravatar.cc/150?u=ervaringen' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Ervaringscadeaus winnen razendsnel terrein: minder spullen, meer betekenis. Een goed gekozen beleving levert verhalen, foto’s en verbondenheid op – en verdwijnt niet in een lade. In deze gids helpen we je gericht kiezen voor verschillende persoonlijkheden & budgetten.' },
  { type: 'paragraph', content: 'Zoek je juist iets technisch of duurzaam? Bekijk ook onze <a href="/blog/cadeaus-voor-tech-liefhebbers">Tech Cadeaugids</a> of de <a href="/blog/duurzame-eco-vriendelijke-cadeaus">Duurzame Cadeaus gids</a> voor alternatieven met hardware of eco-impact.' },
      { type: 'heading', content: 'Waarom een Ervaringscadeau?' },
      { type: 'paragraph', content: 'Psychologisch onderzoek laat zien dat ervaringen vaak meer langdurige tevredenheid geven dan materiële cadeaus. Ze worden gedeeld, opnieuw verteld en vormen emotionele ankerpunten. Zeker voor minimalisten of mensen “die alles al hebben” is dit een gouden categorie.' },
      { type: 'heading', content: 'Avontuur & Adrenaline' },
      { type: 'paragraph', content: 'Voor de durfal of bucket‑list bouwer. Kies iets schaalbaars: van indoor skydive tot klimintro of een escape uitdaging.' },
      { type: 'gift', content: gift_exp_1 },
      { type: 'gift', content: gift_exp_5 },
      { type: 'gift', content: gift_exp_7 },
      { type: 'heading', content: 'Ontspanning & Wellness' },
      { type: 'paragraph', content: 'Perfect voor wie altijd “druk” is. Een wellnessdag of massage cadeaubon forceert letterlijk ontspanning en herstel.' },
      { type: 'gift', content: gift_exp_2 },
      { type: 'gift', content: gift_exp_6 },
      { type: 'heading', content: 'Culinair & Gezellig' },
      { type: 'paragraph', content: 'Samen koken of proeven zorgt voor verbinding. Workshops leveren nieuwe skills + smaakherinneringen.' },
      { type: 'gift', content: gift_exp_3 },
      { type: 'heading', content: 'Creatief & Leren' },
      { type: 'paragraph', content: 'Ideaal voor nieuwsgierige geesten. Creatieve workshops geven tastbaar resultaat en vergroting van zelfvertrouwen.' },
      { type: 'gift', content: gift_exp_4 },
      { type: 'gift', content: gift_exp_8 },
      { type: 'heading', content: 'Vergelijking: Ervaringstypen' },
      { type: 'comparisonTable', headers: ['Avontuur', 'Wellness', 'Workshop'], rows: [
          { feature: 'Intensiteit', values: ['Hoog', 'Laag', 'Middel'] },
          { feature: 'Herinneringswaarde', values: ['Spektakel / verhaal', 'Diepe ontspanning', 'Nieuwe skill'] },
          { feature: 'Geschikt Voor', values: ['Waaghalzen / groepen', 'Stressgevoelige personen', 'Creatieven / hobbyisten'] },
          { feature: 'Voorbereiding', values: ['Reserveren & soms reistijd', 'Reserveren', 'Datum + materiaal soms'] },
          { feature: 'Risico op Niet Gebruiken', values: ['Middel', 'Laag', 'Laag'] }
        ] },
      { type: 'heading', content: 'Plus- & Minpunten per Segment' },
      { type: 'prosCons', items: [
        { title: 'Avontuur', pros: ['Sterk verhaal achteraf', 'Emotionele piek', 'Bucket‑list tick'], cons: ['Niet voor iedereen', 'Kan uitstellen veroorzaken'] },
        { title: 'Wellness', pros: ['Universeel gewaardeerd', 'Stressreductie', 'Makkelijk te plannen'], cons: ['Minder “spectaculair”', 'Soms drukke locaties'] },
        { title: 'Workshops', pros: ['Skill blijft', 'Sociaal & leerzaam', 'Combinatie van fun + groei'], cons: ['Afhankelijk van docent kwaliteit', 'Kan worden uitgesteld'] }
      ] },
      { type: 'heading', content: 'Tips om de Beleving Nog Sterker te Maken' },
      { type: 'paragraph', content: 'Voeg een handgeschreven kaartje toe met een “reden waarom juist dit bij je past”. Plan eventueel alvast 2 datumopties om uitstel te voorkomen. Combineer een workshop met een klein fysiek item (notitieboekje, mok) voor blijvende associatie.' },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Welke ervaring kies je?', content: 'Kies Avontuur voor impact & adrenaline (perfect voor jubilea of mijlpalen), Wellness voor herstel & zorgzaamheid, en Workshops voor blijvende groei. Twijfel je? Combineer een kleinere workshop met een diner: eerst leren, daarna vieren. Zo ontstaat automatisch een verhaal dat langer blijft dan elk object.' }
    ]
  },
  {
    slug: 'duurzame-eco-vriendelijke-cadeaus',
    title: 'Duurzame & Eco‑vriendelijke Cadeaus: 40+ Ideeën die Echt Verschil Maken (2025)',
    excerpt: 'Bewust geven? Deze uitgebreide gids helpt je het perfecte duurzame cadeau te kiezen – van zero waste & energie tot refurbished en ervaringen.',
    imageUrl: '/images/trending-eco.png',
    category: 'Duurzaam',
    author: { name: 'Linda Groen', avatarUrl: 'https://i.pravatar.cc/150?u=lindagroen' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Duurzaam geven is meer dan “iets groens” kopen. Het gaat om producten (of ervaringen) die écht gebruikt worden, langer meegaan, minder verspilling veroorzaken of zelfs positieve impact creëren. In deze gids breken we het op in overzichtelijke thema\'s zodat je gericht kunt kiezen.' },
  { type: 'paragraph', content: 'Liever een ervaring of tech-upgrade i.p.v. spullen? Bekijk ook onze gids met <a href="/blog/beste-ervaringscadeaus-2025">Ervaringscadeaus</a> en de <a href="/blog/cadeaus-voor-tech-liefhebbers">Tech Cadeaus 2025</a>.' },
      { type: 'heading', content: 'Waarom Kiezen voor Duurzame Cadeaus?' },
      { type: 'paragraph', content: 'Een duurzaam cadeau vertelt een verhaal: minder afval, langere levensduur, eerlijke productie of lokale impact. Zeker bij bewuste ontvangers voelt het persoonlijker omdat je laat zien dat je hun waarden deelt.' },
      { type: 'heading', content: 'Dagelijkse Gewoonten' },
      { type: 'paragraph', content: 'Kleine dingen die je elke dag gebruikt hebben op lange termijn de grootste invloed. Vervang wegwerp door stijlvol herbruikbaar of slimmer verbruik.' },
      { type: 'gift', content: gift_duurzaam_1 },
      { type: 'gift', content: gift_duurzaam_7 },
      { type: 'gift', content: gift_duurzaam_3 },
      { type: 'heading', content: 'Energie & Slim Thuis' },
      { type: 'paragraph', content: 'Direct inzicht in energieverbruik motiveert gedragsverandering. Combineer slimme stekkers met routines (lampen / opladers uit). Ook solar powerbanks verlengen de levensduur van apparaten onderweg.' },
      { type: 'gift', content: gift_duurzaam_4 },
      { type: 'gift', content: gift_tech_8 },
      { type: 'heading', content: 'Natuur & Biodiversiteit' },
      { type: 'paragraph', content: 'Cadeaus die natuur helpen zijn educatief én zichtbaar. Een bijenhotel laat letterlijk leven terugkomen in tuin of balkon.' },
      { type: 'gift', content: gift_duurzaam_6 },
      { type: 'heading', content: 'Circulair & Refurbished' },
      { type: 'paragraph', content: 'Refurbished elektronica verlaagt CO₂‑uitstoot en grondstoffenverbruik. Let op batterijconditie, garantie & transparantie van aanbieder.' },
      { type: 'gift', content: gift_duurzaam_5 },
      { type: 'heading', content: 'Eerlijk & Ethisch Genieten' },
      { type: 'paragraph', content: 'Fairtrade en bio producten (koffie, thee, chocolade) maken een fijn verwenmoment betekenisvoller. Voeg een kaartje toe met herkomstverhaal.' },
      { type: 'gift', content: gift_duurzaam_8 },
      { type: 'heading', content: 'Impact Cadeaus' },
      { type: 'paragraph', content: 'Sommige merken doneren een deel van de winst aan sociale of ecologische projecten. Dit vergroot de \"multiplicator\" van jouw cadeau.' },
      { type: 'gift', content: gift_duurzaam_2 },
      { type: 'heading', content: 'Vergelijking: Drie Duurzame Cadeau Types' },
      { type: 'comparisonTable', headers: ['Herbruikbare Beker', 'Refurbished Smartphone', 'Slimme Stekker'], rows: [
          { feature: 'Dagelijks Gebruik', values: ['Ja (koffie / thee)', 'Intensief', 'Passief / monitoring'] },
          { feature: 'Footprint Besparing', values: ['Afvalreductie', 'CO₂ + grondstoffen', 'Stroomverbruik'] },
          { feature: 'Levensduur', values: ['2–4 jaar', '2–5 jaar extra', '3–6 jaar'] },
          { feature: 'Complexiteit', values: ['Geen', 'Laag (setup)', 'Laag'] },
          { feature: 'Story Value', values: ['Bewust kiezen', 'Circulair denken', 'Data = inzicht'] },
        ] },
      { type: 'heading', content: 'Plus- & Minpunten per Segment' },
      { type: 'prosCons', items: [
        { title: 'Herbruikbare Dagelijkse Items', pros: ['Meteen inzetbaar', 'Goedkoop', 'Bewustzijnstrigger'], cons: ['Soms al in bezit', 'Kan verzamelgedrag worden'] },
        { title: 'Refurbished Tech', pros: ['Grote footprint winst', 'Premium kwaliteit goedkoper', 'Garantie vaak inbegrepen'], cons: ['Vertrouwen aanbieder nodig', 'Accu niet altijd 100% nieuw'] },
        { title: 'Slimme Energie Tools', pros: ['Meetbaar effect', 'Bewustwording gezin', 'Betaalbaar instapniveau'], cons: ['Vraagt soms app', 'Data zonder actie = geen winst'] },
      ] },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Hoe kies je hét duurzame cadeau?', content: 'Kies iets dat dagelijks gebruikt wordt (herbruikbare beker, slimme stekker) voor maximale routine-impact. Voor een groter gebaar met verhaal: ga refurbished of combineer een tastbaar item met een ervaring (workshop, natuuruitje). Vermijd “groene gimmicks” – functionaliteit + echte adoptie bepalen of een cadeau duurzaam voelt én is.' }
    ]
  },
  {
    slug: 'cadeaus-voor-tech-liefhebbers',
    title: 'Cadeaus voor Tech-Liefhebbers: 25+ Ideeën van Budget tot High‑End (2025)',
    excerpt: 'Op zoek naar een cadeau voor een gadgetfreak? Van betaalbare desk-upgrades tot smart home en VR – deze gids helpt je de perfecte tech verrassing te kiezen.',
  // Gebruik dezelfde "trending" afbeelding als in de Trending Cadeaugidsen sectie i.p.v. de OG-share image
  imageUrl: '/images/trending-tech.png',
    category: 'Tech',
    author: { name: 'Gifteez Redactie', avatarUrl: 'https://i.pravatar.cc/150?u=techlover' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Tech-liefhebbers zijn geweldig om voor te shoppen – maar ook lastig. Ze hebben vaak al “alles” of zijn kritisch over specs. Geen paniek: in deze gids vind je gestructureerde cadeau-ideeën per thema en budget. Van kleine upgrades die elke dag plezier geven tot indrukwekkende high‑end gadgets.' },
  { type: 'paragraph', content: 'Zoek je iets dat geen ruimte inneemt of juist eco-impact maakt? Bekijk ook onze gids met <a href="/blog/beste-ervaringscadeaus-2025">Ervaringscadeaus</a> of de <a href="/blog/duurzame-eco-vriendelijke-cadeaus">Duurzame Cadeaus 2025</a>.' },
      { type: 'heading', content: 'Budget & Desk Essentials (< €50)' },
      { type: 'paragraph', content: 'Klein maar functioneel: accessoires die dagelijks gebruikt worden winnen het vaak van flashy gimmicks. Denk aan kabelmanagement, ergonomie of laadoplossingen.' },
      { type: 'gift', content: gift_tech_1 },
      { type: 'gift', content: gift_tech_8 },
      { type: 'heading', content: 'Productiviteit & Creatie' },
      { type: 'paragraph', content: 'Tools die typen, concentreren of content maken prettiger maken zijn goud waard. Een goed mechanisch toetsenbord is vaak de grootste “quality of life” upgrade aan een bureau.' },
      { type: 'gift', content: gift_tech_2 },
      { type: 'heading', content: 'Audio & Focus' },
      { type: 'paragraph', content: 'Hybride werk en drukke omgevingen vragen om comfort + ruisdemping. Een mid-range noise cancelling koptelefoon biedt tegenwoordig premium functies zonder topprijs.' },
      { type: 'gift', content: gift_tech_3 },
      { type: 'heading', content: 'Slim Wonen' },
      { type: 'paragraph', content: 'Een smart home starterkit is het perfecte “gateway” cadeau: meteen resultaat (licht, automation) en uitbreidbaar.' },
      { type: 'gift', content: gift_tech_4 },
      { type: 'heading', content: 'Opslag & Data' },
      { type: 'paragraph', content: 'Creators, fotografen en studenten hebben nooit genoeg snelle, betrouwbare opslag. Een portable SSD versnelt workflows dramatisch t.o.v. klassieke HDDs.' },
      { type: 'gift', content: gift_tech_5 },
      { type: 'heading', content: 'Lezen & Ontspanning' },
      { type: 'paragraph', content: 'Een e-reader haalt ruis uit het lezen: geen notificaties, wel lange accuduur. Perfect voor minimalisten én reizigers.' },
      { type: 'gift', content: gift_tech_6 },
      { type: 'heading', content: 'Immersive & Fun' },
      { type: 'paragraph', content: 'VR blijft groeien en is ideaal voor early adopters. Let op comfort, resolutie en stand‑alone mogelijkheden.' },
      { type: 'gift', content: gift_tech_7 },
      { type: 'heading', content: 'Vergelijking: Drie Populaire Tech Cadeau Types' },
      { type: 'comparisonTable', headers: ['Wireless Charger', 'Portable SSD', 'Noise Cancelling Headphones'], rows: [
          { feature: 'Dagelijks Gebruik', values: ['Elke dag op bureau', 'Project / backup sessies', 'Werk & reizen'] },
          { feature: 'Impact Direct', values: ['Direct minder kabelstress', 'Snellere workflows', 'Meer focus & rust'] },
          { feature: 'Leercurve', values: ['Geen', 'Laag', 'Geen'] },
          { feature: 'Upgrade Plezier', values: ['Laag', 'Middel', 'Hoog'] },
          { feature: 'Persoonlijk', values: ['Functioneel', 'Semi-persoonlijk', 'Ervaren als luxe'] },
        ]
      },
      { type: 'heading', content: 'Plus- & Minpunten per Segment' },
      { type: 'prosCons', items: [
          { title: 'Smart Home Starter', pros: ['Direct zichtbaar resultaat', 'Uit te breiden', 'Energiebesparing'], cons: ['Vraagt soms hub/app', 'Niet iedereen wil automatisering'] },
          { title: 'Mechanisch Toetsenbord', pros: ['Verbeterde typervaring', 'Custom switches & keycaps', 'Duurzaam'], cons: ['Geluid kan storend zijn', 'Keuze kan overweldigend zijn'] },
          { title: 'Noise Cancelling Headset', pros: ['Focus & rust', 'Comfortabel voor reizen', 'Betere call kwaliteit'], cons: ['Duurdere modellen voor top ANC', 'Accu slijtage na jaren'] },
        ]
      },
      { type: 'heading', content: 'Duurzame & Verantwoorde Tech' },
      { type: 'paragraph', content: 'Let op: refurbished premium devices of modulair ontwerp (Fairphone / Framework) kunnen een groen alternatief zijn – geef “circulair” als story cadeau.' },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Wat kies je voor welke tech-liefhebber?', content: 'Wil je safe maar nuttig? Ga voor de \n**Portable SSD** of de **Wireless Charger**. Zoek je een “wow”-effect: kies **VR Headset** of een **mechanisch toetsenbord** dat past bij hun stijl. Voor focus en welzijn wint de **Noise Cancelling Koptelefoon**. En twijfel je? Combineer een kleiner desk-accessoire met iets persoonlijks (kaartje / inside joke) – dat maakt ook een technisch cadeau emotioneel waardevol.' }
    ]
  },
  {
    slug: "ultieme-gids-kerstcadeaus",
    title: "De Ultieme Gids voor Kerstcadeaus 2024",
    excerpt: "Van de nieuwste tech-gadgets tot persoonlijke en duurzame cadeaus. Met deze complete gids vind je gegarandeerd het perfecte kerstcadeau voor iedereen op je lijst.",
  imageUrl: "https://picsum.photos/seed/christmas-gifts/800/600",
    category: "Kerstmis",
    author: { name: "Gifteez Redactie", avatarUrl: "https://i.pravatar.cc/150?u=redactie" },
    publishedDate: "2024-11-15",
    content: [
        { type: 'paragraph', content: "De feestdagen staan weer voor de deur en dat betekent maar één ding: de jacht op het perfecte kerstcadeau is geopend! Stress? Niet nodig. Of je nu zoekt naar iets voor je partner, ouders, vrienden of collega's, met onze tips en suggesties wordt het vinden van het perfecte cadeau een fluitje van een cent." },
        { type: 'heading', content: "Tip 1: Het Altijd-Goed Verwenpakket" },
        { type: 'paragraph', content: "Je kunt er bijna niet de mist mee ingaan: een luxe verwenpakket. Ideaal voor wie wel wat ontspanning kan gebruiken na een druk jaar. Denk aan heerlijke geuren, zachte crèmes en een momentje voor zichzelf. Merken als Rituals en L'Occitane hebben prachtige sets voor zowel mannen als vrouwen. Een veilige, maar zeer gewaardeerde keuze." },
        { type: 'gift', content: gift_kerst_1 },
        { type: 'heading', content: "Tip 2: Voor de Tech Liefhebber" },
        { type: 'paragraph', content: "Is jouw dierbare altijd op de hoogte van de nieuwste gadgets? Dan is een tech-cadeau een schot in de roos. Denk aan slimme-huis apparaten, een goede koptelefoon met noise-cancelling of een draadloze oplader. Een draagbare speaker van hoge kwaliteit is ook een fantastisch cadeau voor muziekliefhebbers." },
        { type: 'gift', content: gift_kerst_2 },
    ]
  },
  {
    slug: "vergelijking-draadloze-oordopjes",
    title: "De Beste Draadloze Oordopjes Onder €100 (2025)",
    excerpt: "Op zoek naar de beste 'bang for your buck'? We vergelijken de Anker Soundcore Life P3, JBL Tune 230NC en Sony WF-C500 om jou te helpen de perfecte keuze te maken.",
  imageUrl: "https://picsum.photos/seed/earbuds-wireless/800/600",
    category: "Tech",
    author: { name: "Mark de Cadeau-Expert", avatarUrl: "https://i.pravatar.cc/150?u=mark" },
    publishedDate: "2025-02-01",
    content: [
      { type: 'paragraph', content: "Draadloze oordopjes zijn een fantastisch cadeau, maar de keuze is reusachtig. Zeker in de populaire prijscategorie onder de 100 euro. Geen zorgen, wij hebben het uitzoekwerk voor je gedaan! We zetten drie topmodellen naast elkaar: de veelzijdige Anker Soundcore Life P3, de bas-rijke JBL Tune 230NC en de op geluid gefocuste Sony WF-C500." },
      { type: 'heading', content: "De Kandidaten" },
      { type: 'paragraph', content: "Hieronder introduceren we de drie kanshebbers die we uitgebreid gaan vergelijken." },
      { type: 'gift', content: gift_earbuds_1 },
      { type: 'gift', content: gift_earbuds_2 },
      { type: 'gift', content: gift_earbuds_3 },
      { type: 'heading', content: "Specificaties Vergeleken" },
      {
        type: 'comparisonTable',
        headers: ['Anker Soundcore Life P3', 'JBL Tune 230NC TWS', 'Sony WF-C500'],
        rows: [
          { feature: 'Noise Cancelling', values: ['Ja (Adaptief)', 'Ja (Actief)', 'Nee'] },
          { feature: 'Accuduur (oortjes)', values: ['7 uur', '8 uur', '10 uur'] },
          { feature: 'Accuduur (met case)', values: ['35 uur', '40 uur', '20 uur'] },
          { feature: 'Draadloos Opladen', values: ['Ja', 'Nee', 'Nee'] },
          { feature: 'Waterbestendigheid', values: ['IPX5 (Spatwaterdicht)', 'IPX4 (Spatwaterdicht)', 'IPX4 (Spatwaterdicht)'] },
        ]
      },
      { type: 'heading', content: "Plus- & Minpunten per Model" },
      {
        type: 'prosCons',
        items: [
          {
            title: 'Anker Soundcore Life P3',
            pros: ['Beste noise cancelling in de test', 'Draadloos oplaadbaar', 'Uitgebreide app met equalizer'],
            cons: ['Iets minder diepe bas dan JBL'],
          },
          {
            title: 'JBL Tune 230NC',
            pros: ['Krachtig en diep basgeluid', 'Lange accuduur met case', 'Comfortabele pasvorm'],
            cons: ['Noise cancelling is minder effectief dan Anker', 'Geen draadloos opladen'],
          },
          {
            title: 'Sony WF-C500',
            pros: ['Beste algehele geluidskwaliteit', 'Langste accuduur (oortjes zelf)', 'Compact en lichtgewicht'],
            cons: ['Geen noise cancelling', 'Minder accucapaciteit in de case'],
          }
        ]
      },
      { type: 'heading', content: "Ons Eindoordeel" },
      {
        type: 'verdict',
        title: "Welke moet je kiezen?",
        content: "Voor de meeste mensen is de **Anker Soundcore Life P3** de beste allround keuze. De combinatie van goede noise cancelling, draadloos opladen en een prima geluid voor deze prijs is onverslaanbaar. Zoek je specifiek naar een diepe bas voor genres als hiphop of dance, dan is de **JBL Tune 230NC** een uitstekende concurrent. Ben je een echte audiofiel en is pure geluidskwaliteit voor jou het allerbelangrijkst (en kun je leven zonder noise cancelling)? Dan is de **Sony WF-C500** de winnaar op het gebied van audio."
      }
    ]
  },
  {
    slug: "originele-cadeaus-voor-de-man",
    title: "10 Originele Cadeaus voor de Man Die Alles Al Heeft",
    excerpt: "Moeite met het vinden van een cadeau voor hem? Deze lijst staat vol met unieke en verrassende ideeën die gegarandeerd in de smaak vallen.",
  imageUrl: "https://picsum.photos/seed/gifts-for-him/600/400",
    category: "Voor Hem",
    author: { name: "Mark de Cadeau-Expert", avatarUrl: "https://i.pravatar.cc/150?u=mark" },
    publishedDate: "2024-10-28",
    content: [
      { type: 'paragraph', content: "Het is een jaarlijks terugkerend probleem: wat geef je de man die beweert niets nodig te hebben, of alles al heeft? Geen zorgen, we hebben een lijst samengesteld met cadeaus die hem echt zullen verrassen en die hij misschien niet eens wist dat hij wilde." },
      { type: 'heading', content: "Voor de Man met Gevoel voor Nostalgie" },
      { type: 'paragraph', content: "Iedere man heeft een innerlijk kind. Speel daarop in met een cadeau dat hem terugbrengt naar zijn jeugd, maar dan met een volwassen twist. Een complexe LEGO Technic set is niet alleen leuk om te bouwen, maar staat ook nog eens stoer in zijn kantoor of man-cave." },
      { type: 'gift', content: gift_man_1 },
      { type: 'heading', content: "Voor de Man die van Rituelen Houdt" },
      { type: 'paragraph', content: "Upgrade zijn dagelijkse routine. Een luxe scheerset transformeert een alledaagse handeling in een moment van pure verwennerij. Het is een stijlvol en praktisch cadeau dat laat zien dat je om zijn welzijn geeft." },
      { type: 'gift', content: gift_man_2 },
    ]
  },
  {
    slug: "duurzame-cadeaus-die-goed-doen",
    title: "Duurzame Cadeaus: Geef Een Gift Die Goed Doet",
    excerpt: "Ontdek onze selectie van milieuvriendelijke en ethisch verantwoorde cadeaus. Perfect voor de bewuste consument die de wereld een beetje beter wil maken.",
  imageUrl: "https://picsum.photos/seed/sustainable-gifts/600/400",
    category: "Duurzaam",
    author: { name: "Linda Groen", avatarUrl: "https://i.pravatar.cc/150?u=linda" },
    publishedDate: "2024-10-12",
    content: [
        { type: 'paragraph', content: "Een cadeau geven is leuk, maar een cadeau geven dat ook nog eens goed is voor de planeet, is nog beter! Steeds meer mensen kiezen voor duurzame opties. Hier zijn een paar van onze favorieten die bewijzen dat 'bewust' en 'begeerlijk' perfect samengaan." },
        { type: 'heading', content: "Begin de dag goed én groen" },
        { type: 'paragraph', content: "Wist je dat de wegwerpbekertjes voor koffie een enorme bron van afval zijn? Een stijlvolle, herbruikbare beker is een perfect cadeau voor de koffie- of theeliefhebber die vaak onderweg is. De HuskeeCup is zelfs gemaakt van restmateriaal uit de koffieproductie!" },
        { type: 'gift', content: gift_duurzaam_1 },
        { type: 'heading', content: "Een cadeau met een grote boodschap" },
        { type: 'paragraph', content: "Sommige cadeaus hebben een verhaal. The Good Roll is zo'n merk. Hun toiletpapier is niet alleen gemaakt van 100% gerecycled papier, maar hun missie is om iedereen ter wereld toegang te geven tot veilige en schone toiletten. Een praktisch cadeau met een enorme impact." },
        { type: 'gift', content: gift_duurzaam_2 },
    ]
  },
  {
    slug: "valentijnsdag-cadeau-gids",
    title: "De Ultieme Gids voor Valentijnsdag Cadeaus",
    excerpt: "Of je nu op zoek bent naar iets romantisch, persoonlijks of gewoon leuks, hier vind je de beste cadeaus om je liefde te tonen en de dag onvergetelijk te maken.",
  imageUrl: "https://picsum.photos/seed/valentines-gifts/600/400",
    category: "Valentijnsdag",
    author: { name: "Gifteez Redactie", avatarUrl: "https://i.pravatar.cc/150?u=redactie" },
    publishedDate: "2025-01-10",
    content: [
      { type: 'paragraph', content: "Liefde zit in de lucht! Valentijnsdag is het perfecte moment om je partner te laten zien hoeveel je om hem of haar geeft. Sla de standaard chocolaatjes en bloemen over en kies voor iets echt speciaals met onze tips. We helpen je om een cadeau te vinden dat recht uit het hart komt." },
      { type: 'heading', content: "Tip 1: Geef een Ervaring" },
      { type: 'paragraph', content: "De mooiste cadeaus zijn vaak geen spullen, maar herinneringen. Tijd samen doorbrengen is onbetaalbaar. Plan een romantisch weekendje weg, boek een workshop die jullie samen kunnen doen (zoals pottenbakken of een kookcursus), of koop kaartjes voor een concert van zijn of haar favoriete artiest. Deze cadeaus creëren verhalen die jullie nog jaren zullen delen." },
      { type: 'heading', content: "Tip 2: Een Persoonlijk Sieraad" },
      { type: 'paragraph', content: "Een sieraad is een klassiek romantisch cadeau, maar maak het extra speciaal door het te personaliseren. Laat een ketting, armband of ring graveren met jullie initialen, een belangrijke datum of een korte, betekenisvolle boodschap. Het is een blijvend symbool van jullie liefde." },
    ]
  }
];