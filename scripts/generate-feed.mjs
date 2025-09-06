// scripts/generate-feed.mjs
// Generates a minimal RSS 2.0 feed for blog posts sourced from data/blogData.ts
// This helps discovery (some feed readers) and can aid Google freshness understanding.
import { promises as fs } from 'fs';
import path from 'path';

const SITE = 'https://gifteez.nl';
const BLOG_DATA_FILE = path.resolve('data/blogData.ts');
const OUT_FILE = path.resolve('public/feed.xml');

async function parseBlogPosts() {
  try {
    const src = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const regex = /slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?excerpt:\s*"([^"]+)"[\s\S]*?publishedDate:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"/g;
    const posts = [];
    for (const m of src.matchAll(regex)) {
      posts.push({
        slug: m[1],
        title: m[2],
        excerpt: m[3],
        publishedDate: m[4],
        image: m[5]
      });
    }
    return posts.sort((a,b)=> b.publishedDate.localeCompare(a.publishedDate));
  } catch {
    return [];
  }
}

function escape(str){
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function buildRss(posts){
  const nowRfc = new Date().toUTCString();
  const items = posts.map(p => `\n    <item>\n      <title>${escape(p.title)}</title>\n      <link>${SITE}/blog/${encodeURIComponent(p.slug)}</link>\n      <guid>${SITE}/blog/${encodeURIComponent(p.slug)}</guid>\n      <pubDate>${new Date(p.publishedDate).toUTCString()}</pubDate>\n      <description><![CDATA[${p.excerpt}]]></description>\n    </item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Gifteez Blog</title>\n    <link>${SITE}/blog</link>\n    <description>Nieuwe cadeaugidsen en inspiratie op Gifteez.nl</description>\n    <language>nl-NL</language>\n    <lastBuildDate>${nowRfc}</lastBuildDate>${items}\n  </channel>\n</rss>\n`;
}

async function main(){
  const posts = await parseBlogPosts();
  const rss = buildRss(posts);
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, rss, 'utf8');
  console.log(`✓ Generated ${OUT_FILE} with ${posts.length} posts`);
}

main().catch(e=>{ console.error('Failed to generate feed:', e); process.exit(1); });
