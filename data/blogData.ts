
import { BlogPost, Gift } from '../types';

// Gift Definitions
const gift_duurzaam_1: Gift = {
  productName: "Herbruikbare Koffiebeker (HuskeeCup)",
  description: "Stijlvolle, duurzame beker gemaakt van koffieschillen. Perfect voor onderweg en helpt de afvalberg te verminderen.",
  priceRange: "€15 - €25",
  retailers: [{ name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=HuskeeCup" }],
  imageUrl: "https://picsum.photos/seed/huskee/300/300"
};

const gift_duurzaam_2: Gift = {
  productName: "The Good Roll - Vrolijk toiletpapier",
  description: "100% gerecycled en superzacht toiletpapier. Met de winst bouwen ze toiletten in ontwikkelingslanden. Een cadeau met impact!",
  priceRange: "€20 - €30",
  retailers: [{ name: "The Good Roll", affiliateLink: "https://www.thegoodroll.com/" }],
  imageUrl: "https://picsum.photos/seed/goodroll/300/300"
};

const gift_man_1: Gift = {
    productName: "LEGO Technic Racewagen",
    description: "Een uitdagende en gedetailleerde bouwset voor de man die van techniek en auto's houdt. Urenlang bouwplezier gegarandeerd.",
    priceRange: "€40 - €180",
    retailers: [
        { name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=LEGO+Technic+auto" },
        { name: "Amazon.nl", affiliateLink: "https://www.amazon.nl/s?k=LEGO+Technic+auto" },
    ],
    imageUrl: "https://picsum.photos/seed/legocar/300/300"
};

const gift_man_2: Gift = {
    productName: "Luxe Scheerset",
    description: "Een complete set met een klassiek scheermes, kwast en verzorgende producten voor een authentieke scheerervaring.",
    priceRange: "€50 - €100",
    retailers: [
        { name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=luxe+scheerset+man" },
    ],
    imageUrl: "https://picsum.photos/seed/shaving/300/300"
};

const gift_kerst_1: Gift = {
    productName: "Rituals Verwenpakket",
    description: "Een luxe giftset met heerlijk geurende producten voor een ontspannen moment. Een klassieker die altijd goed is.",
    priceRange: "€25 - €75",
    retailers: [{ name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/s/?searchtext=Rituals+giftset" }],
    imageUrl: "https://picsum.photos/seed/rituals/300/300"
};

const gift_kerst_2: Gift = {
    productName: "Sonos Roam SL Speaker",
    description: "Een compacte, draagbare en krachtige speaker voor thuis en onderweg. Waterdicht en met een indrukwekkend geluid.",
    priceRange: "€150 - €200",
    retailers: [{ name: "Coolblue", affiliateLink: "https://www.coolblue.nl/product/885783/sonos-roam-sl-wit.html" }],
    imageUrl: "https://picsum.photos/seed/sonos/300/300"
};

const gift_earbuds_1: Gift = {
    productName: "Anker Soundcore Life P3",
    description: "Indrukwekkende noise cancelling, draadloos opladen en een aanpasbaar geluid via de app. Enorme waarde voor je geld.",
    priceRange: "€70 - €90",
    retailers: [{ name: "Coolblue", affiliateLink: "https://www.coolblue.nl/product/889553/anker-soundcore-life-p3-zwart.html" }],
    imageUrl: "https://picsum.photos/seed/anker-p3/300/300"
};

const gift_earbuds_2: Gift = {
    productName: "JBL Tune 230NC TWS",
    description: "De kenmerkende diepe bas van JBL, actieve noise cancelling en een comfortabele pasvorm voor dagelijks gebruik.",
    priceRange: "€60 - €80",
    retailers: [{ name: "Bol.com", affiliateLink: "https://www.bol.com/nl/nl/p/jbl-tune-230nc-tws-draadloze-oordopjes-met-noise-cancelling-zwart/9300000057285194/" }],
    imageUrl: "https://picsum.photos/seed/jbl-230/300/300"
};

const gift_earbuds_3: Gift = {
    productName: "Sony WF-C500",
    description: "Focus op geluidskwaliteit. Compact, licht en met Sony's DSEE-technologie die de muziekkwaliteit verbetert.",
    priceRange: "€50 - €70",
    retailers: [{ name: "Amazon.nl", affiliateLink: "https://www.amazon.nl/Sony-WF-C500-volledig-draadloze-hoofdtelefoon/dp/B09HSJ3C64/" }],
    imageUrl: "https://picsum.photos/seed/sony-c500/300/300"
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ultieme-gids-kerstcadeaus",
    title: "De Ultieme Gids voor Kerstcadeaus 2024",
    excerpt: "Van de nieuwste tech-gadgets tot persoonlijke en duurzame cadeaus. Met deze complete gids vind je gegarandeerd het perfecte kerstcadeau voor iedereen op je lijst.",
    imageUrl: "https://picsum.photos/seed/blog-kerst/800/600",
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
    imageUrl: "https://picsum.photos/seed/earbuds-main/800/600",
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
    imageUrl: "https://picsum.photos/seed/blog1/600/400",
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
    imageUrl: "https://picsum.photos/seed/blog2/600/400",
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
    imageUrl: "https://picsum.photos/seed/blog3/600/400",
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