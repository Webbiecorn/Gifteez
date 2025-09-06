
import { DealItem, DealCategory } from '../types';

export const dealOfTheWeek: DealItem = {
  id: 'deal-001',
  name: 'Philips Airfryer XXL',
  description: 'De populairste Airfryer van Nederland, nu met extra korting! Maak heerlijke, gezonde maaltijden voor het hele gezin. Krokant van buiten, zacht van binnen.',
  imageUrl: 'https://picsum.photos/seed/airfryer/800/600',
  price: 'Nu voor €199,95',
  affiliateLink: 'https://www.coolblue.nl/product/863339/philips-airfryer-xxl-hd9650-90-viva-collection.html'
};

export const top10Deals: DealItem[] = [
  { id: 'top-01', name: 'Sonos Roam SL Speaker', description: 'Compact, draagbaar en krachtig geluid voor thuis en onderweg.', imageUrl: 'https://picsum.photos/seed/portable-speaker/300/300', price: '€179,00', affiliateLink: 'https://www.coolblue.nl/product/885783/sonos-roam-sl-wit.html' },
  { id: 'top-02', name: 'Rituals Verwenpakket', description: 'Een luxe giftset met heerlijk geurende producten voor een ontspannen moment.', imageUrl: 'https://picsum.photos/seed/cosmetics-gift-set/300/300', price: 'Vanaf €29,95', affiliateLink: 'https://www.bol.com/nl/nl/s/?searchtext=Rituals+giftset' },
  { id: 'top-03', name: 'LEGO Technic Racewagen', description: 'Uitdagend en gedetailleerd bouwpakket voor urenlang plezier.', imageUrl: 'https://picsum.photos/seed/lego-technic-car/300/300', price: '€44,95', affiliateLink: 'https://www.bol.com/nl/nl/s/?searchtext=LEGO+Technic+auto' },
  { id: 'top-04', name: 'Luxe Kookboek "Simpel"', description: 'Yotam Ottolenghi\'s bestseller vol met heerlijke, eenvoudige recepten.', imageUrl: 'https://picsum.photos/seed/cookbook-recipes/300/300', price: '€32,00', affiliateLink: 'https://www.bol.com/nl/nl/p/simpel/9200000085810026/' },
  { id: 'top-05', name: 'Dopper Insulated Waterfles', description: 'Houdt je drankjes 9 uur warm of 24 uur koud. Stijlvol en duurzaam.', imageUrl: 'https://picsum.photos/seed/reusable-water-bottle/300/300', price: '€29,50', affiliateLink: 'https://www.bol.com/nl/nl/s/?searchtext=dopper+insulated' },
  { id: 'top-06', name: 'JBL Tune 510BT Koptelefoon', description: 'Draadloze on-ear koptelefoon met krachtig basgeluid en lange batterijduur.', imageUrl: 'https://picsum.photos/seed/jbl/300/300', price: '€39,99', affiliateLink: 'https://www.coolblue.nl/product/880281/jbl-tune-510bt-zwart.html' },
  { id: 'top-07', name: 'Gepersonaliseerde Houten Borrelplank', description: 'Laat een naam of tekst graveren voor een uniek en persoonlijk cadeau.', imageUrl: 'https://picsum.photos/seed/charcuterie-board-engraved/300/300', price: '€24,95', affiliateLink: 'https://www.bol.com/nl/nl/s/?searchtext=gepersonaliseerde+borrelplank' },
  { id: 'top-08', name: 'Een Goed Verhaal - Bordspel', description: 'Een hilarisch en creatief spel voor avonden vol plezier met vrienden of familie.', imageUrl: 'https://picsum.photos/seed/board-game-family/300/300', price: '€21,99', affiliateLink: 'https://www.bol.com/nl/nl/p/een-goed-verhaal/9300000009638708/' },
  { id: 'top-09', name: 'The Good Roll - Vrolijk toiletpapier', description: '100% gerecycled en superzacht. Een cadeau met een sociale impact.', imageUrl: 'https://picsum.photos/seed/eco-toilet-paper/300/300', price: '€22,50', affiliateLink: 'https://www.thegoodroll.com/' },
  { id: 'top-10', name: 'BloomPost Brievenbusbloemen', description: 'Verse bloemen, stijlvol verpakt als een verrassing door de brievenbus.', imageUrl: 'https://picsum.photos/seed/letterbox-flowers/300/300', price: 'Vanaf €12,95', affiliateLink: 'https://www.bloompost.nl/' },
];

export const dealCategories: DealCategory[] = [
  {
    title: 'Top Tech Gadgets',
    items: [
        top10Deals[0], // Sonos Speaker
        top10Deals[5], // JBL Koptelefoon
  { id: 'deal-tech-3', name: 'Apple AirTag', description: 'Verlies nooit meer je sleutels, tas of koffer. Een must-have voor iedereen.', imageUrl: 'https://picsum.photos/seed/airtag-tracker/300/300', price: '€35,00', affiliateLink: 'https://www.coolblue.nl/product/884485/apple-airtag-1-stuk.html' },
    ]
  },
  {
    title: 'Beste Keukenaccessoires',
    items: [
  { ...dealOfTheWeek, id: 'deal-keuken-1', description: 'Maak heerlijke, gezonde maaltijden met de populairste Airfryer.', imageUrl: 'https://picsum.photos/seed/airfryer-kitchen/300/300' }, // Airfryer
        top10Deals[3], // Kookboek
        top10Deals[6], // Borrelplank
    ]
  },
  {
    title: 'Populaire Duurzame Keuzes',
    items: [
        top10Deals[4], // Dopper
        top10Deals[8], // The Good Roll
  { id: 'deal-duurzaam-3', name: 'Herbruikbare Koffiebeker (HuskeeCup)', description: 'Stijlvolle, duurzame beker gemaakt van koffieschillen. Perfect voor onderweg.', imageUrl: 'https://picsum.photos/seed/reusable-coffee-cup/300/300', price: '€18,95', affiliateLink: 'https://www.bol.com/nl/nl/s/?searchtext=HuskeeCup' },
    ]
  }
];
