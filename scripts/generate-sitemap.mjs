// scripts/generate-sitemap.mjs
import { promises as fs } from "fs";
import path from "path";
import url from "url";

// Import TS blog data via dynamic transpile (simple, using ts-node-esque loader is overkill). We read and regex slugs.
const BLOG_DATA_FILE = path.resolve("data/blogData.ts");

const SITE = "https://gifteez.nl";
const OUT_FILE = path.resolve("public/sitemap.xml");

// Handmatige “vaste routes” (passen bij jouw app)
const staticRoutes = [
  { loc: `${SITE}/`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/giftfinder`, changefreq: "daily", priority: "0.8" },
  { loc: `${SITE}/blog`, changefreq: "daily", priority: "0.7" },
  { loc: `${SITE}/categories`, changefreq: "weekly", priority: "0.6" },
];

// Als je later blogposts als Markdown toevoegt, zet ze in src/content/posts/*.md
const POSTS_DIR = path.resolve("src/content/posts");

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function getPostUrls() {
  const urls = [];
  // 1. Probeer Markdown posts (optioneel toekomst)
  try {
    const files = await fs.readdir(POSTS_DIR);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const slug = file.replace(/\.md$/, '');
      const filePath = path.join(POSTS_DIR, file);
      const stat = await fs.stat(filePath);
      const lastmod = stat.mtime.toISOString().split('T')[0];
      urls.push({
        loc: `${SITE}/blog/${encodeURIComponent(slug)}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.6'
      });
    }
  } catch (_) {
    // Geen markdown directory – negeren
  }

  // 2. Parse altijd blogData.ts voor actuele slugs (single source of truth)
  try {
    const src = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    // Match per blog object: slug + publishedDate (niet perfect parser maar voldoende)
    const postRegex = /slug:\s*'([^']+)'[\s\S]*?publishedDate:\s*'([^']+)'/g;
    const found = new Set(urls.map(u => u.loc.split('/blog/')[1]));
    let m;
    while ((m = postRegex.exec(src)) !== null) {
      const slug = m[1];
      const published = m[2];
      if (found.has(slug)) continue; // al via markdown
      // validate date format YYYY-MM-DD
      const lastmod = /\d{4}-\d{2}-\d{2}/.test(published) ? published : undefined;
      urls.push({
        loc: `${SITE}/blog/${encodeURIComponent(slug)}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  } catch (err) {
    console.warn('[sitemap] Kon blogData.ts niet parsen:', err.message);
  }

  return urls;
}

function buildXml(urls) {
  const items = urls
    .map((u) => {
      const last = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      return `
  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${last}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

async function main() {
  const posts = await getPostUrls();
  const urls = [...staticRoutes, ...posts];
  const xml = buildXml(urls);
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, xml.trim(), "utf8");
  console.log(`✓ Generated ${OUT_FILE} with ${urls.length} URLs`);
}

main().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
