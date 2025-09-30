
import { QuizQuestion, QuizResult } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: "Hoe brengt jouw vriend(in) het liefst een vrije zaterdag door?",
    kind: 'persona',
    answers: [
      { text: "Lekker thuis op de bank met een film of boek.", value: 'homebody', resultKey: 'homebody' },
      { text: "Een nieuwe stad ontdekken of een wandeling in de natuur.", value: 'adventurer', resultKey: 'adventurer' },
      { text: "Uitgebreid koken en vrienden uitnodigen voor een diner.", value: 'foodie', resultKey: 'foodie' },
      { text: "Een museum bezoeken of naar een concert gaan.", value: 'creative', resultKey: 'creative' },
    ],
  },
  {
    id: 2,
    text: "Welk type cadeau zou hij/zij het meest waarderen?",
    kind: 'persona',
    answers: [
      { text: "Iets praktisch dat het dagelijks leven makkelijker maakt.", value: 'homebody', resultKey: 'homebody' },
      { text: "Een onvergetelijke ervaring of een avontuur.", value: 'adventurer', resultKey: 'adventurer' },
      { text: "Een luxe delicatesse of een speciaal kookgadget.", value: 'foodie', resultKey: 'foodie' },
      { text: "Iets unieks en handgemaakts met een persoonlijk verhaal.", value: 'creative', resultKey: 'creative' },
    ],
  },
  {
    id: 3,
    text: "Als ze op vakantie gaan, wat kiezen ze dan?",
    kind: 'persona',
    answers: [
      { text: "Een comfortabel huisje waar ze helemaal tot rust kunnen komen.", value: 'homebody', resultKey: 'homebody' },
      { text: "Een backpack-reis door een onbekend land.", value: 'adventurer', resultKey: 'adventurer' },
      { text: "Een culinaire tour door Italië of Frankrijk.", value: 'foodie', resultKey: 'foodie' },
      { text: "Een citytrip vol kunst, cultuur en architectuur.", value: 'creative', resultKey: 'creative' },
    ],
  },
  {
    id: 4,
    text: "Wat is je ideale budget voor dit cadeau?",
    kind: 'budget',
    metaKey: 'budget',
    answers: [
      {
        text: "Tot €25",
        value: 'budget-low',
        helperText: "Slimme kleinigheden met veel impact",
      },
      {
        text: "€25 - €75",
        value: 'budget-mid',
        helperText: "Populaire cadeaus zonder te overdrijven",
      },
      {
        text: "€75+",
        value: 'budget-high',
        helperText: "Statement gifts en premium experiences",
      },
    ],
  },
  {
    id: 5,
    text: "Wat is jouw relatie tot de ontvanger?",
    kind: 'relationship',
    metaKey: 'relationship',
    answers: [
      { text: "Partner", value: 'partner' },
      { text: "Vriend(in)", value: 'friend' },
      { text: "Collega", value: 'colleague' },
      { text: "Familie", value: 'family' },
    ],
  },
  {
    id: 6,
    text: "Voor welke gelegenheid zoek je een cadeau?",
    kind: 'occasion',
    metaKey: 'occasion',
    answers: [
      { text: "Verjaardag", value: 'birthday' },
      { text: "Housewarming", value: 'housewarming' },
      { text: "Feestdagen", value: 'holidays' },
      { text: "Jubileum", value: 'anniversary' },
    ],
  },
];

export const quizResults: Record<string, QuizResult> = {
  homebody: {
    title: "De Huiselijke Genieter",
    description: "Deze persoon hecht waarde aan comfort, rust en gezelligheid. Een perfect cadeau voor hen maakt hun huis nog aangenamer of helpt ze te ontspannen. Denk aan zachte dekens, sfeerverlichting, een goed boek of een luxe set voor een spa-dag thuis.",
    recommendedInterests: "Wellness, Lezen, Films, Koken, Interieur",
    // Updated September 2025: prune removed blog slugs
    relatedBlogSlugs: ["ai-smart-home-gadgets-2025", "duurzame-eco-vriendelijke-cadeaus"],
    shoppingList: {
      'budget-low': [
        {
          title: "Aroma relax-set",
          description: "Mini wellnesspakket met geurkaars en zachte sokken.",
          url: "/cadeaus/homebody-budget-low",
        },
        {
          title: "Warmte kruik 2.0",
          description: "Stijlvolle kruik die decoratief blijft in de woonkamer.",
          url: "/cadeaus/homebody-haard",
        },
      ],
      'budget-mid': [
        {
          title: "Luxe plaid van gerecyclede wol",
          description: "Duurzaam en superzacht voor knusse avonden.",
          url: "/cadeaus/homebody-plaid",
        },
        {
          title: "Slow-coffee starterset",
          description: "Mooie koffiecarafe met premium bonen voor slow mornings.",
          url: "/cadeaus/homebody-coffee",
        },
      ],
      'budget-high': [
        {
          title: "Smart ambient lighting bundle",
          description: "Slimme lichtsets voor ultieme relax vibe.",
          url: "/cadeaus/homebody-lighting",
        },
        {
          title: "Wellness weekend getaway",
          description: "Hotelvoucher inclusief spa en massages.",
          url: "/cadeaus/homebody-wellness",
        },
      ],
    },
    occasionHighlights: {
      birthday: "Voor een verjaardag werkt een luxe verwenmoment thuis fantastisch.",
      housewarming: "Voor een housewarming is iets dat meteen sfeer brengt een voltreffer.",
      holidays: "Met de feestdagen scoor je met cosy essentials voor donkere avonden.",
      anniversary: "Voor een jubileum doet een gedeelde relax-ervaring het altijd goed.",
    },
  },
  adventurer: {
    title: "De Avontuurlijke Ontdekker",
    description: "Stilzitten is niks voor deze persoon! Ze houden van nieuwe ervaringen, reizen en de buitenlucht. Een geweldig cadeau is iets dat hun volgende avontuur ondersteunt, zoals een goede rugzak, een portable speaker, een outdoor-gadget of een reisgids.",
    recommendedInterests: "Reizen, Sport, Outdoor, Fotografie, Avontuur",
    relatedBlogSlugs: ["ai-smart-home-gadgets-2025", "duurzame-eco-vriendelijke-cadeaus"],
    shoppingList: {
      'budget-low': [
        {
          title: "Travel mini-utility kit",
          description: "Compact setje met must-have travel gadgets.",
          url: "/cadeaus/adventurer-kit",
        },
        {
          title: "Outdoor koffie set",
          description: "Opvouwbaar koffiefilter voor onderweg.",
          url: "/cadeaus/adventurer-coffee",
        },
      ],
      'budget-mid': [
        {
          title: "Ervaringsvoucher city escape",
          description: "Weekend escape room + hoteldeal voor twee.",
          url: "/cadeaus/adventurer-experience",
        },
        {
          title: "Duurzame daypack",
          description: "Waterafstotende rugzak gemaakt van gerecyclede materialen.",
          url: "/cadeaus/adventurer-daypack",
        },
      ],
      'budget-high': [
        {
          title: "Smart travel drone",
          description: "Compacte drone om elk avontuur vast te leggen.",
          url: "/cadeaus/adventurer-drone",
        },
        {
          title: "Bucketlist ervaring",
          description: "Hot-air ballooning of ice driving experience.",
          url: "/cadeaus/adventurer-bucketlist",
        },
      ],
    },
    occasionHighlights: {
      birthday: "Voor een verjaardag is een verrassingsactiviteit een perfecte keuze.",
      housewarming: "Voor een housewarming kun je denken aan praktische travel gear voor het nieuwe hoofdstuk.",
      holidays: "Met de feestdagen maak je indruk met een avontuur voor het nieuwe jaar.",
      anniversary: "Voor een jubileum is samen een once-in-a-lifetime trip plannen onvergetelijk.",
    },
  },
  foodie: {
    title: "De Culinaire Fijnproever",
    description: "Het leven van deze persoon draait om lekker eten en drinken. Ze zijn vaak in de keuken te vinden of proberen het nieuwste restaurant in de stad. Maak ze blij met een speciaal kookboek, een luxe ingrediënt, een mooie pannenset, of een workshop van een topchef.",
    recommendedInterests: "Koken, Eten, Wijn, Barbecue, Restaurants",
    relatedBlogSlugs: ["duurzame-eco-vriendelijke-cadeaus", "ai-smart-home-gadgets-2025"],
    shoppingList: {
      'budget-low': [
        {
          title: "Taste flight mini",
          description: "Set van drie bijzondere kruidenmixen van lokale makers.",
          url: "/cadeaus/foodie-kruiden",
        },
        {
          title: "Espresso tonic kit",
          description: "Trendy zomerdrank die je thuis naschenkt.",
          url: "/cadeaus/foodie-espresso-tonic",
        },
      ],
      'budget-mid': [
        {
          title: "Chef's workshop voucher",
          description: "Leer een signature gerecht maken met een pro-chef.",
          url: "/cadeaus/foodie-workshop",
        },
        {
          title: "Premium serveerplank",
          description: "Handgemaakte plank met gegraveerde boodschap.",
          url: "/cadeaus/foodie-plank",
        },
      ],
      'budget-high': [
        {
          title: "Fine dining tasting experience",
          description: "Reservering bij een toprestaurant inclusief wine pairing.",
          url: "/cadeaus/foodie-tasting",
        },
        {
          title: "Smart sous-vide bundle",
          description: "Professionele set om sterrenchef thuis te worden.",
          url: "/cadeaus/foodie-sous-vide",
        },
      ],
    },
    occasionHighlights: {
      birthday: "Voor een verjaardag scoor je met een proeverij of traktatie voor het feest.",
      housewarming: "Housewarming? Ga voor iets dat meteen in de nieuwe keuken straalt.",
      holidays: "Met de feestdagen past een luxe gourmetbox perfect.",
      anniversary: "Voor een jubileum kies je voor een romantisch diner of shared tasting.",
    },
  },
  creative: {
    title: "De Creatieve Ziel",
    description: "Deze persoon heeft een passie voor kunst, muziek, design en zelfexpressie. Ze waarderen unieke, handgemaakte en esthetisch mooie dingen. Denk aan een prachtig notitieboek, een set professionele potloden, een museumkaart, of een design-object voor in huis.",
    recommendedInterests: "Kunst, Muziek, Design, Fotografie, DIY",
    relatedBlogSlugs: ["duurzame-eco-vriendelijke-cadeaus", "ai-smart-home-gadgets-2025"],
    shoppingList: {
      'budget-low': [
        {
          title: "Creative spark kit",
          description: "Set met premium schetsboek en art markers.",
          url: "/cadeaus/creative-spark",
        },
        {
          title: "Mini soundscapes abonnement",
          description: "Maandelijkse playlists en inspiratiekaartjes.",
          url: "/cadeaus/creative-soundscapes",
        },
      ],
      'budget-mid': [
        {
          title: "Workshop keramiek of screenprinting",
          description: "Hands-on sessie met lokale maker.",
          url: "/cadeaus/creative-workshop",
        },
        {
          title: "Design smart lighting",
          description: "Modulaire lichtsculptuur voor studio of woonkamer.",
          url: "/cadeaus/creative-lighting",
        },
      ],
      'budget-high': [
        {
          title: "Artist-in-residence retreat",
          description: "Weekend retreat om te creëren met begeleiding.",
          url: "/cadeaus/creative-retreat",
        },
        {
          title: "Premium digitale tekentablet",
          description: "Voor next-level illustraties en design.",
          url: "/cadeaus/creative-tablet",
        },
      ],
    },
    occasionHighlights: {
      birthday: "Voor een verjaardag voelt een limited edition art piece extra speciaal.",
      housewarming: "Housewarming? Geef iets dat de creatieve studio in het nieuwe huis afmaakt.",
      holidays: "Met de feestdagen passen creatieve bundles die nieuwe projecten inspireren.",
      anniversary: "Voor een jubileum werkt een shared workshop of kunstervaring verbindend.",
    },
  },
};
