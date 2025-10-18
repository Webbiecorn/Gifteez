#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

/**
 * Generate RSS 2.0 feed for Pinterest auto-publishing
 * Based on Pinterest specs: https://help.pinterest.com/nl/business/article/auto-publish-pins-from-your-rss-feed
 */

// Your blog posts data
const blogPosts = [
  {
    slug: 'duurzame-cadeaus-2025',
    title: 'Top 10 Duurzame Cadeaus voor 2025',
    excerpt: 'Ontdek de mooiste duurzame en milieuvriendelijke cadeaus die écht verschil maken.',
    imageUrl: '/images/trending-eco.jpg',
    category: 'Duurzaamheid',
    publishedAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  },
  {
    slug: 'tech-gifts-2025',
    title: 'De Beste Tech Cadeaus van 2025',
    excerpt: 'Van smart home gadgets tot wearables - dit zijn de tech cadeaus die iedereen wil hebben.',
    imageUrl: '/images/trending-tech.jpg',
    category: 'Technologie',
    publishedAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z'
  },
  {
    slug: 'ervaring-cadeaus',
    title: 'Waarom Ervaringscadeaus de Beste Keuze Zijn',
    excerpt: 'Geef herinneringen die een leven lang meegaan met deze geweldige ervaringscadeaus.',
    imageUrl: '/images/trending-experience.jpg',
    category: 'Ervaringen',
    publishedAt: '2024-12-05T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z'
  },
  {
    slug: 'ai-smart-home-gifts',
    title: 'AI-Powered Smart Home Cadeaus: De Toekomst is Nu',
    excerpt: 'Transformeer elk huis met slimme technologie die écht verschil maakt. Van stemgestuurde assistenten tot automatische verlichting.',
    imageUrl: '/images/og-tech-gifts-2025.png',
    category: 'Technologie',
    publishedAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z'
  }
];

const SITE_URL = 'https://gifteez-7533b.web.app';
const SITE_NAME = 'Gifteez';
const SITE_DESCRIPTION = 'Vind het perfecte cadeau met onze AI-powered GiftFinder. Gepersonaliseerde cadeau-ideeën voor elke gelegenheid.';
const SITE_LANGUAGE = 'nl-NL';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRFC822Date(dateString) {
  const date = new Date(dateString);
  return date.toUTCString();
}

function generateRssFeed(posts) {
  const latestUpdate = posts.reduce((latest, post) => {
    const postDate = new Date(post.updatedAt || post.publishedAt);
    return postDate > latest ? postDate : latest;
  }, new Date(0));

  const items = posts
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .map(post => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const imageUrl = post.imageUrl.startsWith('http') 
        ? post.imageUrl 
        : `${SITE_URL}${post.imageUrl}`;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${formatRFC822Date(post.publishedAt)}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" />
      <media:content url="${escapeXml(imageUrl)}" type="image/jpeg" medium="image" />
      <media:thumbnail url="${escapeXml(imageUrl)}" />
    </item>`;
    }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <lastBuildDate>${formatRFC822Date(latestUpdate.toISOString())}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;
}

async function main() {
  console.log('📰 Generating RSS feed for Pinterest...\n');

  const rssFeed = generateRssFeed(blogPosts);
  const outputPath = join(projectRoot, 'public', 'rss.xml');

  // Ensure public directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Write RSS feed
  await writeFile(outputPath, rssFeed, 'utf-8');

  console.log(`✅ RSS feed generated: ${outputPath}`);
  console.log(`📊 Included ${blogPosts.length} blog posts`);
  console.log(`\n📌 Pinterest Setup:`);
  console.log(`   1. Claim your domain: ${SITE_URL}`);
  console.log(`   2. RSS Feed URL: ${SITE_URL}/rss.xml`);
  console.log(`   3. Go to Settings → Bulk create → Link RSS feed`);
  console.log(`   4. Choose a Pinterest board`);
  console.log(`   5. Up to 200 pins/day will be created automatically!\n`);
}

main().catch(error => {
  console.error('❌ Error generating RSS feed:', error);
  process.exit(1);
});
