// scripts/generate-sitemap.mjs
import { promises as fs } from "fs";
import path from "path";
import url from "url";

// Import TS blog data via dynamic transpile (simple, using ts-node-esque loader is overkill). We read and regex slugs.
const BLOG_DATA_FILE = path.resolve("data/blogData.ts");

const SITE = "https://gifteez.nl";
const OUT_FILE = path.resolve("public/sitemap.xml");

// Handmatige “vaste routes” (passen bij jouw app) – uitgebreid voor betere dekking
const today = new Date().toISOString().split('T')[0];
const staticRoutes = [
  { loc: `${SITE}/`, changefreq: "daily", priority: "0.9", lastmod: today },
  { loc: `${SITE}/giftfinder`, changefreq: "daily", priority: "0.8", lastmod: today },
  { loc: `${SITE}/blog`, changefreq: "daily", priority: "0.7", lastmod: today },
  { loc: `${SITE}/categories`, changefreq: "weekly", priority: "0.6", lastmod: today },
  { loc: `${SITE}/deals`, changefreq: "daily", priority: "0.7", lastmod: today },
  { loc: `${SITE}/quiz`, changefreq: "weekly", priority: "0.6", lastmod: today },
  { loc: `${SITE}/about`, changefreq: "monthly", priority: "0.3", lastmod: today },
  { loc: `${SITE}/contact`, changefreq: "monthly", priority: "0.3", lastmod: today },
  { loc: `${SITE}/disclaimer`, changefreq: "yearly", priority: "0.2", lastmod: today },
  { loc: `${SITE}/privacy`, changefreq: "yearly", priority: "0.2", lastmod: today }
];

// Als je later blogposts als Markdown toevoegt, zet ze in src/content/posts/*.md
const POSTS_DIR = path.resolve("src/content/posts");

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function getPostUrls() {
  const urls = [];
  try {
    const files = await fs.readdir(POSTS_DIR);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(POSTS_DIR, file);
      const stat = await fs.stat(filePath);
      const lastmod = stat.mtime.toISOString().split("T")[0];
      urls.push({
        loc: `${SITE}/blog/${encodeURIComponent(slug)}`,
        lastmod,
        changefreq: "weekly",
        priority: "0.6",
      });
    }
    return urls;
  } catch (e) {
    // Fallback: parse blogData.ts (slugs + publishedDate)
    try {
      const src = await fs.readFile(BLOG_DATA_FILE, "utf8");
      const postMatches = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?publishedDate:\s*"([^"]+)"/g)];
      for (const m of postMatches) {
        const slug = m[1];
        const publishedDate = m[2];
        urls.push({
          loc: `${SITE}/blog/${encodeURIComponent(slug)}`,
          lastmod: publishedDate,
          changefreq: "weekly",
          priority: "0.7"
        });
      }
      return urls;
    } catch (err) {
      return [];
    }
  }
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
