/**
 * Generate a topic-based Unsplash image URL. This uses source.unsplash.com
 * which returns a relevant image for the given query and size.
 * Note: Images from Unsplash are free to use; attribution is appreciated.
 */
export function topicImage(query: string, w: number, h: number) {
  // Temporary fallback: use Picsum with a deterministic seed per query to avoid Unsplash outages (503).
  // Seed by query so images stay stable between builds but vary across topics.
  const seed = encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Commonly used topics */
export const Topics = {
  tech: 'tech gadgets gift',
  eco: 'eco friendly gifts sustainable',
  experience: 'gift experience adventure',
  foodie: 'food gift gourmet',
  mailbox: 'mailbox gift subscription',
  travel: 'travel gift accessories',
  planner: 'gift planner notebook desk',
  about: 'gift wrapping table present',
  airfryer: 'airfryer kitchen appliance',
  speaker: 'portable speaker',
  rituals: 'rituals cosmetics gift set',
  lego: 'lego technic car set',
  cookbook: 'cookbook recipe book',
  bottle: 'reusable water bottle',
  board: 'charcuterie board engraving',
  boardgame: 'board game family',
  toiletpaper: 'eco toilet paper packaging',
  flowers: 'letterbox flowers bouquet',
  airtag: 'apple airtag tracker',
  huskee: 'reusable coffee cup',
  shaving: 'shaving kit classic',
  earbuds: 'wireless earbuds',
};
