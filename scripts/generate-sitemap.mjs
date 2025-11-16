// scripts/generate-sitemap.mjs
import { promises as fs } from "fs";
import { existsSync } from "fs";
import path from "path";

// Import TS blog data via dynamic transpile (simple, using ts-node-esque loader is overkill). We read and regex slugs.
const BLOG_DATA_FILE = path.resolve("data/blogData.ts");
const PROGRAMMATIC_DATA_FILE = path.resolve("data/programmatic/index.ts");

const SITE = "https://gifteez.nl";
const SERVICE_ACCOUNT_ENV = process.env.FIREBASE_SERVICE_ACCOUNT;
const SERVICE_ACCOUNT_JSON_ENV = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const DEFAULT_SERVICE_ACCOUNT_FILE = "gifteez-7533b-firebase-adminsdk.json";
const guidePathConfig = JSON.parse(
  await fs.readFile(new URL("../guide-paths.json", import.meta.url), "utf8")
);
const GUIDE_BASE_PATH = guidePathConfig.basePath;
const OUT_FILE = path.resolve("public/sitemap.xml");

// Handmatige "vaste routes" (passen bij jouw app)
const staticRoutes = [
  { loc: `${SITE}/`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE}/giftfinder`, changefreq: "daily", priority: "0.8" },
  { loc: `${SITE}/deals`, changefreq: "daily", priority: "0.8" },
  { loc: `${SITE}${GUIDE_BASE_PATH}`, changefreq: "daily", priority: "0.8" },
  { loc: `${SITE}/blog`, changefreq: "daily", priority: "0.7" },
  { loc: `${SITE}/categories`, changefreq: "weekly", priority: "0.6" },
  // Category pages
  { loc: `${SITE}/deals/category/feest-party-partypro`, changefreq: "weekly", priority: "0.7" },
  { loc: `${SITE}/deals/category/duurzame-cadeaus-slygad`, changefreq: "weekly", priority: "0.7" },
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

async function loadServiceAccountCredentials() {
  if (SERVICE_ACCOUNT_JSON_ENV) {
    try {
      return JSON.parse(SERVICE_ACCOUNT_JSON_ENV);
    } catch (error) {
      console.warn("[sitemap] Kon FIREBASE_SERVICE_ACCOUNT_JSON niet parsen:", error.message);
      return null;
    }
  }

  const candidatePath = SERVICE_ACCOUNT_ENV
    ? path.resolve(SERVICE_ACCOUNT_ENV)
    : path.resolve(DEFAULT_SERVICE_ACCOUNT_FILE);

  if (!existsSync(candidatePath)) {
    return null;
  }

  try {
    const raw = await fs.readFile(candidatePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn("[sitemap] Kon service account niet lezen:", error.message);
    return null;
  }
}

const normalizeDate = (value) => {
  if (!value) return undefined;
  if (typeof value === "string") {
    const match = value.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : undefined;
  }
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (value && typeof value.toDate === "function") {
    return value.toDate().toISOString().split("T")[0];
  }
  if (typeof value === "object" && value !== null && "seconds" in value && "nanoseconds" in value) {
    const millis = value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000);
    return new Date(millis).toISOString().split("T")[0];
  }
  return undefined;
};

async function getFirestorePostUrls() {
  const serviceAccount = await loadServiceAccountCredentials();
  if (!serviceAccount) {
    console.warn("[sitemap] Geen service account gevonden, sla Firestore posts over.");
    return [];
  }

  try {
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);
    const snapshot = await db
      .collection("blogPosts")
      .where("isDraft", "==", false)
      .orderBy("publishedDate", "desc")
      .get();

    if (snapshot.empty) {
      console.warn("[sitemap] Geen Firestore blogposts gevonden.");
      return [];
    }

    const urls = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data?.slug) {
          return null;
        }
        const lastmod = normalizeDate(data.updatedAt ?? data.publishedDate);
        return {
          loc: `${SITE}/blog/${encodeURIComponent(data.slug)}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.75",
        };
      })
      .filter(Boolean);

    console.log(`[sitemap] Firestore blogposts toegevoegd: ${urls.length}`);
    return urls;
  } catch (error) {
    console.warn("[sitemap] Ophalen van Firestore posts mislukt:", error.message);
    return [];
  }
}

async function getProgrammaticUrls() {
  try {
    const src = await fs.readFile(PROGRAMMATIC_DATA_FILE, "utf8");
    const regex = /slug:\s*'([^']+)'/g;
    const seen = new Set();
    const urls = [];
    let match;
    while ((match = regex.exec(src)) !== null) {
      const slug = match[1];
      if (seen.has(slug)) continue;
      seen.add(slug);
      urls.push({
        loc: `${SITE}${GUIDE_BASE_PATH}/${encodeURIComponent(slug)}`,
        changefreq: "daily",
        priority: "0.74",
      });
    }
    return urls;
  } catch (err) {
    console.warn("[sitemap] Kon programmatic index niet parsen:", err.message);
    return [];
  }
}

const mergeUrls = (...lists) => {
  const map = new Map();
  lists.forEach((list = []) => {
    list.forEach((entry) => {
      if (!entry?.loc) return;
      map.set(entry.loc, entry);
    });
  });
  return Array.from(map.values());
};

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
  const [staticPosts, firestorePosts, programmatic] = await Promise.all([
    getPostUrls(),
    getFirestorePostUrls(),
    getProgrammaticUrls(),
  ]);
  const posts = mergeUrls(staticPosts, firestorePosts);
  const urls = [...staticRoutes, ...programmatic, ...posts];
  const xml = buildXml(urls);
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, xml.trim(), "utf8");
  console.log(`✓ Generated ${OUT_FILE} with ${urls.length} URLs`);
}

main().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
