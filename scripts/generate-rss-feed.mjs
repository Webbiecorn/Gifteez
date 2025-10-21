#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

/**
 * Generate RSS 2.0 feed for Pinterest auto-publishing
 * Based on Pinterest specs: https://help.pinterest.com/nl/business/article/auto-publish-pins-from-your-rss-feed
 */

const SITE_URL = 'https://gifteez.nl';
const SITE_NAME = 'Gifteez';
const SITE_DESCRIPTION = 'Vind het perfecte cadeau met onze AI-powered GiftFinder. Gepersonaliseerde cadeau-ideeën voor elke gelegenheid.';
const SITE_LANGUAGE = 'nl-NL';

/**
 * Load blog posts from blogData.ts by parsing the TypeScript file
 */
async function loadBlogPosts() {
  try {
    // Read blogData.ts as text
    const blogDataPath = join(projectRoot, 'data', 'blogData.ts');
    const blogDataContent = await readFile(blogDataPath, 'utf-8');
    
    const posts = [];
    
    // Find each blog post - extract fields individually for better multi-line handling
    // Look for slug patterns first
    const slugMatches = [...blogDataContent.matchAll(/slug:\s*'([^']+)',/g)];
    
    console.log(`🔍 Found ${slugMatches.length} slug matches`);
    
    for (const slugMatch of slugMatches) {
      const slug = slugMatch[1];
      const slugIndex = slugMatch.index;
      
      console.log(`   Processing: ${slug} at index ${slugIndex}`);
      
      // Find the next slug or end of array to determine this post's content
      const nextSlugMatch = blogDataContent.indexOf("slug: '", slugIndex + 10);
      const endIndex = nextSlugMatch > 0 ? nextSlugMatch : blogDataContent.length;
      const postContent = blogDataContent.substring(slugIndex, endIndex);
      
      // Extract fields from this post's content
      const titleMatch = postContent.match(/title:\s*'([^']+)',/);
      const excerptMatch = postContent.match(/excerpt:\s*[\n\s]*["']([\s\S]+?)["'],/);
      const imageUrlMatch = postContent.match(/imageUrl:\s*'([^']+)',/);
      const categoryMatch = postContent.match(/category:\s*'([^']+)',/);
      const publishedDateMatch = postContent.match(/publishedDate:\s*'([^']+)',/);
      
      if (titleMatch && excerptMatch && imageUrlMatch && categoryMatch && publishedDateMatch) {
        posts.push({
          slug,
          title: titleMatch[1],
          excerpt: excerptMatch[1],
          imageUrl: imageUrlMatch[1],
          category: categoryMatch[1],
          publishedAt: `${publishedDateMatch[1]}T10:00:00Z`,
          updatedAt: `${publishedDateMatch[1]}T10:00:00Z`
        });
      } else {
        console.log(`   ⚠️  Skipping ${slug} - missing fields:`, {
          hasTitle: !!titleMatch,
          hasExcerpt: !!excerptMatch,
          hasImage: !!imageUrlMatch,
          hasCategory: !!categoryMatch,
          hasDate: !!publishedDateMatch
        });
      }
    }
    
    console.log(`✅ Loaded ${posts.length} blog posts from blogData.ts`);
    return posts;
    
  } catch (error) {
    console.warn('⚠️  Could not load blog posts from blogData.ts:', error.message);
    console.warn('Stack:', error.stack);
    return [];
  }
}

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

  // Load blog posts from blogData.ts
  const blogPosts = await loadBlogPosts();
  
  if (blogPosts.length === 0) {
    console.warn('⚠️  No blog posts found to generate RSS feed - skipping');
    return;
  }

  const rssFeed = generateRssFeed(blogPosts);
  const outputPath = join(projectRoot, 'public', 'rss.xml');

  // Ensure public directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Write RSS feed
  await writeFile(outputPath, rssFeed, 'utf-8');

  console.log(`✅ RSS feed generated: ${outputPath}`);
  console.log(`📊 Included ${blogPosts.length} blog posts`);
  console.log(`\n📝 Blog posts in feed:`);
  blogPosts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title} (${post.category})`);
  });
  console.log(`\n📌 Pinterest Setup:`);
  console.log(`   1. Claim your domain: ${SITE_URL}`);
  console.log(`   2. RSS Feed URL: ${SITE_URL}/rss.xml`);
  console.log(`   3. Go to Settings → Bulk create → Link RSS feed`);
  console.log(`   4. Choose a Pinterest board`);
  console.log(`   5. Up to 200 pins/day will be created automatically!\n`);
}

main().catch(error => {
  console.error('❌ Error generating RSS feed:', error);
  // Don't exit with error code to not break build
  process.exit(0);
});
