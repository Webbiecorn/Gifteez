
import { QuizQuestion, QuizResult } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: "Hoe brengt jouw vriend(in) het liefst een vrije zaterdag door?",
    answers: [
      { text: "Lekker thuis op de bank met een film of boek.", resultKey: 'homebody' },
      { text: "Een nieuwe stad ontdekken of een wandeling in de natuur.", resultKey: 'adventurer' },
      { text: "Uitgebreid koken en vrienden uitnodigen voor een diner.", resultKey: 'foodie' },
      { text: "Een museum bezoeken of naar een concert gaan.", resultKey: 'creative' },
    ],
  },
  {
    id: 2,
    text: "Welk type cadeau zou hij/zij het meest waarderen?",
    answers: [
      { text: "Iets praktisch dat het dagelijks leven makkelijker maakt.", resultKey: 'homebody' },
      { text: "Een onvergetelijke ervaring of een avontuur.", resultKey: 'adventurer' },
      { text: "Een luxe delicatesse of een speciaal kookgadget.", resultKey: 'foodie' },
      { text: "Iets unieks en handgemaakts met een persoonlijk verhaal.", resultKey: 'creative' },
    ],
  },
  {
    id: 3,
    text: "Als ze op vakantie gaan, wat kiezen ze dan?",
    answers: [
      { text: "Een comfortabel huisje waar ze helemaal tot rust kunnen komen.", resultKey: 'homebody' },
      { text: "Een backpack-reis door een onbekend land.", resultKey: 'adventurer' },
      { text: "Een culinaire tour door Italië of Frankrijk.", resultKey: 'foodie' },
      { text: "Een citytrip vol kunst, cultuur en architectuur.", resultKey: 'creative' },
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
  },
  adventurer: {
    title: "De Avontuurlijke Ontdekker",
    description: "Stilzitten is niks voor deze persoon! Ze houden van nieuwe ervaringen, reizen en de buitenlucht. Een geweldig cadeau is iets dat hun volgende avontuur ondersteunt, zoals een goede rugzak, een portable speaker, een outdoor-gadget of een reisgids.",
    recommendedInterests: "Reizen, Sport, Outdoor, Fotografie, Avontuur",
  relatedBlogSlugs: ["ai-smart-home-gadgets-2025", "duurzame-eco-vriendelijke-cadeaus"],
  },
  foodie: {
    title: "De Culinaire Fijnproever",
    description: "Het leven van deze persoon draait om lekker eten en drinken. Ze zijn vaak in de keuken te vinden of proberen het nieuwste restaurant in de stad. Maak ze blij met een speciaal kookboek, een luxe ingrediënt, een mooie pannenset, of een workshop van een topchef.",
    recommendedInterests: "Koken, Eten, Wijn, Barbecue, Restaurants",
  relatedBlogSlugs: ["duurzame-eco-vriendelijke-cadeaus", "ai-smart-home-gadgets-2025"],
  },
  creative: {
    title: "De Creatieve Ziel",
    description: "Deze persoon heeft een passie voor kunst, muziek, design en zelfexpressie. Ze waarderen unieke, handgemaakte en esthetisch mooie dingen. Denk aan een prachtig notitieboek, een set professionele potloden, een museumkaart, of een design-object voor in huis.",
    recommendedInterests: "Kunst, Muziek, Design, Fotografie, DIY",
  relatedBlogSlugs: ["duurzame-eco-vriendelijke-cadeaus", "ai-smart-home-gadgets-2025"],
  },
};
